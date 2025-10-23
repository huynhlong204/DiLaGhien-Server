import { Module } from '@nestjs/common';
import { TripClientService } from './trip-client.service';
import { TripClientController } from './trip-client.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TicketsModule } from '../tickets/tickets.module';
import { TicketsService } from '../tickets/tickets.service';
import { ReviewService } from '../review/review.service';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [PrismaModule, ReviewModule],
  controllers: [TripClientController],
  providers: [TripClientService],
})
export class TripClientModule { }
