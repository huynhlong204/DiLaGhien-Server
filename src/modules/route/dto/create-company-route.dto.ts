
import { IsInt, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyRouteDto {
  @ApiProperty({ description: 'ID của công ty' })
  @IsInt()
  @IsNotEmpty()
  company_id: number;

  @ApiProperty({ description: 'ID của tuyến đường' })
  @IsInt()
  @IsNotEmpty()
  route_id: number;

  @ApiPropertyOptional({ description: 'Trạng thái duyệt của tuyến đường (mặc định là false nếu không được cung cấp)' })
  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}