import { Module } from '@nestjs/common';
import { VnpayModule } from 'nestjs-vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule { }
