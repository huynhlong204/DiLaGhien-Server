import { Module } from '@nestjs/common';
import { SeatLayoutTemplatesController } from './seat-layout-templates.controller';
import { SeatLayoutTemplatesService } from './seat-layout-templates.service';

@Module({
  controllers: [SeatLayoutTemplatesController],
  providers: [SeatLayoutTemplatesService],
  exports: [SeatLayoutTemplatesService],
})
export class SeatLayoutTemplatesModule {}
