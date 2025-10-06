import { Module } from '@nestjs/common';
import { TripService } from './trips.service';
import { TripsController } from './trips.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TripsController],
  providers: [TripService],
})
export class TripsModule {}
