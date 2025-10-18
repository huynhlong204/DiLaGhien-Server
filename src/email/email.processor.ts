import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { MailerService } from '@nestjs-modules/mailer';
import { Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';

@Processor('email') // Lắng nghe queue tên là 'email'
export class EmailProcessor {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly mailerService: MailerService) { }

    @Process('sendBookingConfirmation') // Xử lý job tên 'sendBookingConfirmation'
    async handleSendConfirmationEmail(job: Job) {
        const { tickets, passengerEmail } = job.data;
        this.logger.log(`Starting to send confirmation email to ${passengerEmail} for ${tickets.length} tickets.`);

        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            formattedPrice: new Intl.NumberFormat('vi-VN').format(ticket.final_amount),
            paymentDateFormatted: moment(ticket.payments[0].createdAt).tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY'),
            trip: {
                ...ticket.trip,
                departureTimeFormatted: moment(ticket.trip.departure_time).tz('Asia/Ho_Chi_Minh').format('HH:mm'),
                departureDateFormatted: moment(ticket.trip.departure_time).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY'),
            },
        }));

        try {
            await this.mailerService.sendMail({
                to: passengerEmail,
                subject: `Xác nhận đặt vé thành công - Mã vé [${formattedTickets.map(t => t.code).join(', ')}]`,
                template: './booking-confirmation', // trỏ đến file booking-confirmation.hbs
                context: {
                    tickets: formattedTickets,
                },
            });
            this.logger.log(`Successfully sent email to ${passengerEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${passengerEmail}`, error.stack);
            throw error;
        }
    }
}