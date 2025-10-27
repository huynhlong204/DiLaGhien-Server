import { Module } from '@nestjs/common';
import { TripClientService } from './trip-client.service';
import { TripClientController } from './trip-client.controller';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [ReviewModule],
  controllers: [TripClientController],
  providers: [TripClientService],
})
export class TripClientModule {}
