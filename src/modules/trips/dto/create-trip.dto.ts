// src/modules/trips/dto/create-trip.dto.ts
import {
  IsInt,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { TripStatus } from '../enums/trip-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({
    description: 'ID của liên kết công ty-tuyến đường (company_routes) mà chuyến đi này sẽ đi theo. Đây là ID từ bảng company_routes.',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  company_route_id: number;

  @ApiProperty({
    description: 'ID của phương tiện được gán cho chuyến đi (tùy chọn).',
    example: 101,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  vehicle_id?: number | null;

  @ApiProperty({
    description: 'Thời gian khởi hành của chuyến đi (định dạng ISO 8601 string).',
    example: '2025-07-15T10:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  departure_time: string;

  @ApiProperty({
    description: 'Giá vé mặc định cho chuyến đi.',
    example: 150000.00,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price_default: number;

  @ApiProperty({
    description: 'Trạng thái ban đầu của chuyến đi (mặc định là "scheduled").',
    enum: TripStatus,
    example: TripStatus.SCHEDULED,
    required: false,
  })
  @IsEnum(TripStatus)
  @IsOptional()
  status: TripStatus = TripStatus.SCHEDULED;

  @ApiProperty({
    description: 'ID của mẫu bố trí ghế được sử dụng cho chuyến đi (tùy chọn).',
    example: 1,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  seat_layout_templatesId?: number | null;

  @ApiProperty({
    description: 'ID của tài xế được gán cho chuyến đi (tùy chọn).',
    example: 201,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  driver_id?: number | null;

  @ApiProperty({
    description: 'ID của loại phương tiện (tùy chọn).',
    example: 301,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  vehicle_type_id?: number | null;
}