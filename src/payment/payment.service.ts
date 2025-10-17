// src/payment/payment.service.ts

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as qs from 'qs';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) { }

    async createVnpayPaymentUrl(payload: any, ipAddr: string): Promise<string> {
        const tmnCode = this.configService.get<string>('VNP_TMNCODE');
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET');
        const vnpUrl = this.configService.get<string>('VNP_URL');
        const returnUrl = this.configService.get<string>('VNP_RETURN_URL');

        if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
            this.logger.error('VNPay configuration is missing in .env file!');
            throw new InternalServerErrorException('VNPay configuration is missing');
        }

        const date = new Date();
        const createDate = moment(date).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
        const expireDate = moment(date).add(15, 'minutes').tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
        const orderId = `BOOKING${moment(date).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss')}`;
        const amount = payload.totalPrice;

        // Bước 1: Lưu thông tin vé và giao dịch vào DB với trạng thái PENDING
        try {
            await this.prisma.$transaction(async (tx) => {
                for (const seatCode of payload.seats) {
                    await tx.tickets.create({
                        data: {
                            code: `TICKET_${Date.now()}_${seatCode}`,
                            trip_id: payload.tripId,
                            seat_code: seatCode,
                            status: 'PENDING_PAYMENT',
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
                                    amount: payload.totalPrice,
                                    status: 'PENDING',
                                    transaction_id: orderId,
                                },
                            },
                        },
                    });
                }
            });
            this.logger.log(`Successfully saved pending booking for Order [${orderId}]`);
        } catch (error) {
            this.logger.error(`Failed to save pending booking for Order [${orderId}]`, error);
            throw new InternalServerErrorException('Could not create booking');
        }

        // Bước 2: Tạo URL thanh toán VNPAY
        const vnp_Params: Record<string, any> = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Amount: amount * 100,
            vnp_CurrCode: 'VND',
            vnp_CreateDate: createDate,
            vnp_ExpireDate: expireDate,
            vnp_IpAddr: ipAddr,
            vnp_Locale: 'vn',
            vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
            vnp_TxnRef: orderId,
        };

        const sortedParams = this.sortObject(vnp_Params);
        const signData = qs.stringify(sortedParams, { encode: false });

        // ======================= THÊM VÀO ĐỂ DEBUG =======================
        console.log('--- DEBUG VNPAY ---');
        console.log('Secret Key đang dùng:', secretKey);
        console.log('Chuỗi dữ liệu để Hash (signData):', signData);
        console.log('--- END DEBUG ---');
        // =================================================================

        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        sortedParams['vnp_SecureHash'] = signed;
        const paymentUrl = `${vnpUrl}?${qs.stringify(sortedParams, { encode: true })}`;

        this.logger.log(`Created VNPay Payment URL for Order [${orderId}]`);
        return paymentUrl;
    }

    handleVnpayCallback(vnpayParams: any): { RspCode: string; Message: string; isValidSignature: boolean } {
        const secretKey = this.configService.get<string>('VNP_HASH_SECRET');

        if (!secretKey) {
            this.logger.error('VNPay secret key is not configured for callback verification!');
            return { RspCode: '97', Message: 'Invalid Signature (missing key)', isValidSignature: false };
        }

        const secureHash = vnpayParams['vnp_SecureHash'];
        delete vnpayParams['vnp_SecureHash'];
        delete vnpayParams['vnp_SecureHashType'];

        const sortedParams = this.sortObject(vnpayParams);
        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            this.logger.log(`VNPay callback signature is valid for Order [${vnpayParams['vnp_TxnRef']}]`);
            // TODO: Thêm logic cập nhật trạng thái đơn hàng trong DB tại đây
            return { RspCode: '00', Message: 'Confirm Success', isValidSignature: true };
        } else {
            this.logger.warn(`VNPay callback signature is invalid for Order [${vnpayParams['vnp_TxnRef']}]`);
            return { RspCode: '97', Message: 'Invalid Signature', isValidSignature: false };
        }
    }

    private sortObject(obj: Record<string, any>): Record<string, any> {
        const sorted: Record<string, any> = {};
        const keys = Object.keys(obj).sort();
        for (const key of keys) {
            sorted[key] = obj[key];
        }
        return sorted;
    }
}