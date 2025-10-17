// src/payment/payment.controller.ts

import { Controller, Post, Get, Body, Req, Res, Query, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly configService: ConfigService,
    ) { }

    @Post('create-vnpay-url')
    async createPaymentUrl(@Body() bookingPayload: any, @Req() req: Request) {
        const ipAddr = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
        const finalIpAddr = ipAddr?.includes('::1') ? '127.0.0.1' : ipAddr;

        if (!finalIpAddr) {
            return { statusCode: 400, message: 'Cannot determine IP address' };
        }

        const paymentUrl = await this.paymentService.createVnpayPaymentUrl(
            bookingPayload,
            finalIpAddr,
        );

        return { statusCode: 200, message: 'URL created successfully', url: paymentUrl };
    }

    @Get('vnpay_return')
    // Thêm async
    async vnpayReturn(@Query() vnpayParams: any, @Res() res: Response) {
        this.logger.log('Received VNPay return with params:', vnpayParams);
        // Thêm await
        const result = await this.paymentService.handleVnpayCallback(vnpayParams);
        const frontendResultUrl = this.configService.get<string>('FRONTEND_RESULT_URL');

        if (!frontendResultUrl) {
            res.status(500).send('Frontend result URL is not configured');
            return;
        }

        // Dùng result.RspCode thay vì vnpayParams['vnp_ResponseCode'] để đảm bảo logic nhất quán
        if (result.isValidSignature && result.RspCode === '00') {
            res.redirect(`${frontendResultUrl}?success=true&orderId=${vnpayParams['vnp_TxnRef']}`);
        } else {
            res.redirect(`${frontendResultUrl}?success=false&orderId=${vnpayParams['vnp_TxnRef']}`);
        }
    }

    @Get('vnpay_ipn')
    // Thêm async
    async vnpayIpn(@Query() vnpayParams: any, @Res() res: Response) {
        this.logger.log('Received VNPay IPN with params:', vnpayParams);
        // Thêm await
        const result = await this.paymentService.handleVnpayCallback(vnpayParams);
        res.status(200).json({ RspCode: result.RspCode, Message: result.Message });
    }
}