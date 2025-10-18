import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TicketsService } from '../modules/tickets/tickets.service';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        @InjectRedis() private readonly redis: Redis,
        @InjectQueue('email') private readonly emailQueue: Queue,
        private readonly ticketsService: TicketsService, // Service được inject để xử lý logic vé
    ) { }

    async createVnpayPaymentUrl(payload: any, ipAddr: string): Promise<string> {
        const tmnCode = this.configService.get<string>('VNP_TMNCODE');
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET');
        let vnpUrl = this.configService.get<string>('VNP_URL');
        const returnUrl = this.configService.get<string>('VNP_RETURN_URL');

        if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
            this.logger.error('VNPay configuration is missing in .env file!');
            throw new InternalServerErrorException('VNPay configuration is missing');
        }

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = `BOOKING${moment(date).format('YYYYMMDDHHmmss')}`;
        const amount = payload.totalPrice;

        try {
            // Lưu payload vào Redis, sẽ được sử dụng lại ở hàm callback
            await this.redis.set(`booking:${orderId}`, JSON.stringify(payload), 'EX', 900); // 15 phút
            this.logger.log(`Saved pending booking info to Redis for Order [${orderId}]`);
        } catch (error) {
            this.logger.error(`Failed to save pending booking to Redis for Order [${orderId}]`, error);
            throw new InternalServerErrorException('Could not process booking request');
        }

        const vnp_Params: Record<string, any> = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': tmnCode,
            'vnp_Amount': amount * 100,
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': `Thanh toan don hang ${orderId}`,
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr,
            'vnp_CreateDate': createDate,
        };

        const sortedParams = this.sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        sortedParams['vnp_SecureHash'] = signed;

        vnpUrl += '?' + qs.stringify(sortedParams, { encode: false });

        return vnpUrl;
    }

    async handleVnpayCallback(vnpayParams: any): Promise<{ RspCode: string; Message: string; isValidSignature: boolean }> {
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET');
        if (!secretKey) {
            return { RspCode: '97', Message: 'Invalid Signature (missing key)', isValidSignature: false };
        }

        const secureHash = vnpayParams['vnp_SecureHash'];
        delete vnpayParams['vnp_SecureHash'];
        delete vnpayParams['vnp_SecureHashType'];
        const sortedParams = this.sortObject(vnpayParams);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash !== signed) {
            this.logger.warn(`VNPay callback signature is invalid for Order [${vnpayParams['vnp_TxnRef']}]`);
            return { RspCode: '97', Message: 'Invalid Signature', isValidSignature: false };
        }

        const orderId = vnpayParams['vnp_TxnRef'];
        const responseCode = vnpayParams['vnp_ResponseCode'];
        const amountFromVnpay = parseInt(vnpayParams['vnp_Amount']) / 100;

        try {
            const bookingDataString = await this.redis.get(`booking:${orderId}`);
            if (!bookingDataString) {
                this.logger.warn(`Order [${orderId}] not found in Redis or has expired.`);
                return { RspCode: '01', Message: 'Order not found or expired', isValidSignature: true };
            }

            const payload = JSON.parse(bookingDataString);
            if (payload.totalPrice !== amountFromVnpay) {
                this.logger.error(`Amount mismatch for Order [${orderId}].`);
                return { RspCode: '04', Message: 'Amount invalid', isValidSignature: true };
            }

            if (responseCode === '00') {
                // TÁI CẤU TRÚC: Gọi TicketsService để tạo vé, thay vì xử lý logic ở đây
                const result = await this.ticketsService.createTicketsAfterPayment(payload, orderId);

                // Đẩy job gửi email vào queue sau khi đã có kết quả từ TicketsService
                if (result && result.tickets.length > 0) {
                    await this.emailQueue.add('sendBookingConfirmation', {
                        tickets: result.tickets,
                        passengerEmail: payload.passengerInfo.email,
                    });
                    this.logger.log(`Dispatched email job for order ${orderId} to queue.`);
                }

                await this.redis.del(`booking:${orderId}`);
                this.logger.log(`Successfully processed booking and tickets for Order [${orderId}]`);
                return { RspCode: '00', Message: 'Confirm Success', isValidSignature: true };

            } else {
                // Thanh toán thất bại
                await this.redis.del(`booking:${orderId}`);
                this.logger.log(`Payment failed for order ${orderId}. Removed from Redis.`);
                return { RspCode: responseCode, Message: 'Payment Failed', isValidSignature: true };
            }

        } catch (error) {
            this.logger.error(`Error processing callback for order ${orderId}`, error);
            // Cân nhắc thêm logic hoàn tiền VNPAY ở đây nếu có lỗi sau khi đã thanh toán
            return { RspCode: '99', Message: 'Unknown error', isValidSignature: true };
        }
    }

    private sortObject(obj: Record<string, any>): Record<string, any> {
        const sorted: Record<string, any> = {};
        const str: string[] = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (const key of str) {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        }
        return sorted;
    }
}