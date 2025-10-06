// src/vehicles/dto/update-vehicle.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateVehicleDto } from './create-vehicle.dto';
import { IsOptional, IsString, IsIn, MaxLength, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {
  // Có thể override lại nếu muốn validation khác cho update, 
  // nhưng thường PartialType là đủ.
  // Tuy nhiên, để đảm bảo IsIn cho status và các decorator khác
  // khi PartialType không tự động sao chép chúng một cách triệt để,
  // chúng ta có thể thêm lại như sau:

  @ApiPropertyOptional({
    description: 'Biển số xe',
    example: '51F-123.45',
  })
  @IsOptional()
  @IsString({ message: 'Biển số xe phải là chuỗi.' })
  @MaxLength(50, { message: 'Biển số xe không được quá 50 ký tự.' })
  plate_number?: string;

  @ApiPropertyOptional({
    description: 'Hãng xe',
    example: 'Hyundai',
  })
  @IsOptional()
  @IsString({ message: 'Hãng xe phải là chuỗi.' })
  @MaxLength(100, { message: 'Hãng xe không được quá 100 ký tự.' })
  brand?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái xe (active, maintenance, inactive)',
    example: 'maintenance',
    enum: ['active', 'maintenance', 'inactive'],
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái xe phải là chuỗi.' })
  @IsIn(['active', 'maintenance', 'inactive'], { message: 'Trạng thái xe không hợp lệ.' })
  status?: string;

  @ApiPropertyOptional({
    description: 'ID của loại xe (từ vehicle_types)',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'ID loại xe phải là số nguyên.' })
  vehicle_type_id?: number;

  @ApiPropertyOptional({
    description: 'ID của sơ đồ ghế (từ seat_layout_templates)',
    example: 2,
  })
  @IsOptional()
  @IsInt({ message: 'ID sơ đồ ghế phải là số nguyên.' })
  seat_layout_template_id?: number;
}