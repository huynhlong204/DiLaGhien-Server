import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MailerService } from '@nestjs-modules/mailer'; // Import MailerService

@Controller('api') // Giả sử prefix của bạn là 'api'
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly mailerService: MailerService, // Inject MailerService
    ) { }

    @Get('test-email')
    async testEmail() {
        try {
            console.log('--- BẮT ĐẦU GỬI TEST EMAIL ---');
            await this.mailerService.sendMail({
                to: 'hnhatlong04@gmail.com', // Dùng email thật của bạn để nhận
                subject: 'Email test từ Ứng dụng NestJS',
                template: './booking-confirmation', // Dùng lại template cũ
                context: { // Dữ liệu giả để test
                    tickets: [
                        {
                            code: 'TEST-123',
                            formattedPrice: '150,000',
                            paymentDateFormatted: '10:00 18/10/2025',
                            seat_code: 'A1',
                            trip: {
                                route: { departure: 'Sài Gòn', destination: 'Đà Lạt' },
                                bus: { license_plate: '51F-12345' },
                                departureTimeFormatted: '08:00',
                                departureDateFormatted: '19/10/2025',
                            },
                        },
                    ],
                },
            });
            console.log('--- GỬI TEST EMAIL THÀNH CÔNG ---');
            return { message: 'Test email sent successfully!' };
        } catch (error) {
            console.error('--- LỖI KHI GỬI TEST EMAIL ---', error);
            throw new Error(`Failed to send test email: ${error.message}`);
        }
    }
}