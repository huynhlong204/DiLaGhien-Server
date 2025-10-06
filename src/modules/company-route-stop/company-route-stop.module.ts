import { Module } from '@nestjs/common';
import { CompanyRouteStopsService } from './company-route-stop.service';
import { CompanyRouteStopsController } from './company-route-stop.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyRouteStopsController],
  providers: [CompanyRouteStopsService],
})
export class CompanyRouteStopModule {}
