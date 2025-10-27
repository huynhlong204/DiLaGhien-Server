import { Module } from '@nestjs/common';
import { TripService } from './trips.service';
import { TripsController } from './trips.controller';

@Module({
  controllers: [TripsController],
  providers: [TripService],
})
export class TripsModule {}
