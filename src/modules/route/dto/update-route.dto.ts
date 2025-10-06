
import { IsInt, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRouteDto {
  @ApiPropertyOptional({ description: 'ID mới của điểm đi' })
  @IsInt()
  @IsOptional()
  from_location_id?: number;

  @ApiPropertyOptional({ description: 'ID mới của điểm đến' })
  @IsInt()
  @IsOptional()
  to_location_id?: number;

  @ApiPropertyOptional({ description: 'Thời gian di chuyển ước tính mới' })
  @IsString()
  @IsOptional()
  estimated_time?: string;
}