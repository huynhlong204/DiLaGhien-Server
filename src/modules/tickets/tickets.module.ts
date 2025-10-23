import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Prisma } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TicketsGateway } from './tickets.gateway';
import { TripClientModule } from '../trip-client/trip-client.module';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [PrismaModule, PromotionModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsGateway],
  exports: [TicketsService]
})
export class TicketsModule { }
