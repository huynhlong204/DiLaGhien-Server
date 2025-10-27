import { Module } from '@nestjs/common';
import { TripClientService } from './trip-client.service';
import { TripClientController } from './trip-client.controller';
import { ReviewModule } from '../review/review.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ReviewModule, HttpModule],
  controllers: [TripClientController],
  providers: [TripClientService],
})
export class TripClientModule {}
