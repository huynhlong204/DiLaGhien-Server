import { Module } from '@nestjs/common';
import { CompanyRouteStopsService } from './company-route-stop.service';
import { CompanyRouteStopsController } from './company-route-stop.controller';

@Module({
  controllers: [CompanyRouteStopsController],
  providers: [CompanyRouteStopsService],
})
export class CompanyRouteStopModule {}
