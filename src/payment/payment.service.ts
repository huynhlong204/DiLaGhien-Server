// src/payment/payment.service.ts

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';
import { Prisma } from '@prisma/client';
import { InjectRedis } from '@nestjs-modules/ioredis'; // Thêm import này
import { Redis } from 'ioredis'; // Thêm import này

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        @InjectRedis() private readonly redis: Redis, // Thêm Redis vào constructor
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

        // BƯỚC 1: LƯU TẠM THÔNG TIN ĐẶT VÉ VÀO REDIS
        try {
            // Thời gian hết hạn là 15 phút (900 giây), khớp với VNPAY
            await this.redis.set(`booking:${orderId}`, JSON.stringify(payload), 'EX', 900);
            this.logger.log(`Saved pending booking info to Redis for Order [${orderId}]`);
        } catch (error) {
            this.logger.error(`Failed to save pending booking to Redis for Order [${orderId}]`, error);
            throw new InternalServerErrorException('Could not process booking request');
        }

        // Tạo các tham số và URL VNPAY như cũ
        let vnp_Params: Record<string, any> = {
            'vnp_Version': '2.1.0', 'vnp_Command': 'pay', 'vnp_TmnCode': tmnCode,
            'vnp_Amount': amount * 100, 'vnp_CurrCode': 'VND', 'vnp_TxnRef': orderId,
            'vnp_OrderInfo': `Thanh_toan_don_hang_${orderId}`, 'vnp_OrderType': 'other',
            'vnp_Locale': 'vn', 'vnp_ReturnUrl': returnUrl, 'vnp_IpAddr': ipAddr,
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
        // ... (phần xác thực chữ ký giữ nguyên)
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET');
        if (!secretKey) { /* ... */ return { RspCode: '97', Message: 'Invalid Signature (missing key)', isValidSignature: false }; }
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

        // BƯỚC 2: XỬ LÝ LOGIC SAU KHI XÁC THỰC THÀNH CÔNG
        const orderId = vnpayParams['vnp_TxnRef'];
        const responseCode = vnpayParams['vnp_ResponseCode'];
        const amountFromVnpay = parseInt(vnpayParams['vnp_Amount']) / 100;

        try {
            const bookingDataString = await this.redis.get(`booking:${orderId}`);
            if (!bookingDataString) {
                this.logger.warn(`Order [${orderId}] not found in Redis or has expired.`);
                // Giao dịch đã hết hạn hoặc không tồn tại
                return { RspCode: '01', Message: 'Order not found or expired', isValidSignature: true };
            }

            const payload = JSON.parse(bookingDataString);

            // Kiểm tra số tiền có khớp không
            if (payload.totalPrice !== amountFromVnpay) {
                this.logger.error(`Amount mismatch for Order [${orderId}]. Expected: ${payload.totalPrice}, received: ${amountFromVnpay}`);
                return { RspCode: '04', Message: 'Amount invalid', isValidSignature: true };
            }

            // Nếu thanh toán thất bại, chỉ cần xóa key khỏi Redis và báo lỗi
            if (responseCode !== '00') {
                await this.redis.del(`booking:${orderId}`);
                this.logger.log(`Payment failed for order ${orderId}. Removed from Redis.`);
                return { RspCode: responseCode, Message: 'Payment Failed', isValidSignature: true };
            }

            // THANH TOÁN THÀNH CÔNG -> LƯU VÀO DATABASE
            await this.prisma.$transaction(async (tx) => {
                for (const seatCode of payload.seats) {
                    // Kiểm tra ghế lần cuối để tránh race condition
                    const existingTicket = await tx.tickets.findFirst({
                        where: { trip_id: payload.tripId, seat_code: seatCode, NOT: { status: 'CANCELLED' } }
                    });
                    if (existingTicket) {
                        // Nếu ghế đã bị đặt, throw lỗi để rollback transaction
                        throw new Error(`Seat ${seatCode} for trip ${payload.tripId} has already been booked.`);
                    }

                    const uniqueTicketCode = await this.generateUniqueTicketCode(tx);
                    await tx.tickets.create({
                        data: {
                            code: uniqueTicketCode,
                            trip_id: payload.tripId,
                            seat_code: seatCode,
                            status: 'CONFIRMED', // Trạng thái đã xác nhận
                            final_amount: payload.totalPrice / payload.seats.length,
                            ticket_details: {
                                create: {
                                    passenger_name: payload.passengerInfo.fullName,
                                    passenger_phone: payload.passengerInfo.phone,
                                    passenger_email: payload.passengerInfo.email,
                                },
                            },
                            payments: {
                                create: {
                                    method: 'VNPAY',
                                    amount: payload.totalPrice / payload.seats.length,
                                    status: 'SUCCESS', // Trạng thái thành công
                                    transaction_id: `${orderId}_${seatCode}`,
                                },
                            },
                        },
                    });
                }
            });

            // Xóa key khỏi Redis sau khi đã lưu DB thành công
            await this.redis.del(`booking:${orderId}`);
            this.logger.log(`Successfully created booking and tickets for Order [${orderId}]`);
            return { RspCode: '00', Message: 'Confirm Success', isValidSignature: true };

        } catch (error) {
            this.logger.error(`Error processing callback for order ${orderId}`, error);
            // Nếu có lỗi (ví dụ ghế đã bị đặt), trả về lỗi cho VNPAY
            return { RspCode: '99', Message: 'Unknown error', isValidSignature: true };
        }
    }

    // ... (Các hàm private sortObject và generateUniqueTicketCode giữ nguyên)
    private sortObject(obj: Record<string, any>): Record<string, any> {
        const sorted: Record<string, any> = {};
        const str: string[] = [];
        let key: string;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                str.push(encodeURIComponent(key));
            }
        }
        str.sort();
        for (key of str) {
            sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
        }
        return sorted;
    }

    private async generateUniqueTicketCode(tx: Prisma.TransactionClient): Promise<string> {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let isUnique = false;
        let code: string;
        while (!isUnique) {
            code = 'VE';
            for (let i = 0; i < 8; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            const existing = await tx.tickets.findUnique({ where: { code } });
            if (!existing) {
                isUnique = true;
            }
        }
        return code!;
    }
}