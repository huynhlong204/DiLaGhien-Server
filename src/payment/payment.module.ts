import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsModule } from 'src/modules/tickets/tickets.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => TicketsModule),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService],
})
export class PaymentModule { }
