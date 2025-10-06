import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleTypeDto {
  @ApiProperty({
    description: 'Tên loại xe (ví dụ: "Xe giường nằm 40 chỗ")',
    example: 'Xe khách 45 chỗ',
  })
  @IsString({ message: 'Tên loại xe phải là chuỗi.' })
  @IsNotEmpty({ message: 'Tên loại xe không được để trống.' })
  @MaxLength(255, { message: 'Tên loại xe không được quá 255 ký tự.' })
  name: string;

  @ApiProperty({
    description: 'Mô tả chi tiết về loại xe',
    example: 'Loại xe khách tiêu chuẩn, phù hợp cho các tuyến đường dài.',
    required: false,
  })
  @IsString({ message: 'Mô tả phải là chuỗi.' })
  @IsOptional()
  description?: string;
}