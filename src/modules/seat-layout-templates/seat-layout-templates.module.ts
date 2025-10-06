import { Module } from '@nestjs/common';
import { SeatLayoutTemplatesController } from './seat-layout-templates.controller';
import { SeatLayoutTemplatesService } from './seat-layout-templates.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SeatLayoutTemplatesController],
  providers: [SeatLayoutTemplatesService, PrismaService],
  exports: [SeatLayoutTemplatesService],
})
export class SeatLayoutTemplatesModule {}

