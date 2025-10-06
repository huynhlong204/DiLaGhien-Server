// src/modules/trips/dto/create-recurring-trip.dto.ts
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import { CreateTripDto } from './create-trip.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecurringTripDto extends CreateTripDto {
  @ApiProperty({
    example: 7,
    description: 'Số ngày liên tiếp tạo chuyến đi (ví dụ: 7 để tạo 7 chuyến đi hàng ngày).',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  recurrenceDays: number;
}