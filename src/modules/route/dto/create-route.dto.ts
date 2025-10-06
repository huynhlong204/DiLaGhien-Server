import { IsInt, IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRouteDto {
  @ApiProperty({ description: 'ID của điểm đi' })
  @IsInt()
  @IsNotEmpty()
  from_location_id: number;

  @ApiProperty({ description: 'ID của điểm đến' })
  @IsInt()
  @IsNotEmpty()
  to_location_id: number;

  @ApiProperty({ description: 'Thời gian di chuyển ước tính (ví dụ: "2 giờ 30 phút")' })
  @IsString()
  @IsNotEmpty()
  estimated_time: string;
}