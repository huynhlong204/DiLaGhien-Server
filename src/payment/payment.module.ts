import { forwardRef, Module } from '@nestjs/common';
import { VnpayModule } from 'nestjs-vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { TicketsModule } from 'src/modules/tickets/tickets.module';
import { EmailProcessor } from 'src/email/email.processor';
import { TicketsService } from 'src/modules/tickets/tickets.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email',
    }),
    forwardRef(() => TicketsModule)
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, EmailProcessor],
})
export class PaymentModule { }
