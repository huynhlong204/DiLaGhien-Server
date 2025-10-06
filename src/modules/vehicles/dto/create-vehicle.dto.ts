// src/vehicles/dto/create-vehicle.dto.ts
import { IsString, IsNotEmpty, IsInt, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Biển số xe',
    example: '51F-123.45',
  })
  @IsString({ message: 'Biển số xe phải là chuỗi.' })
  @IsNotEmpty({ message: 'Biển số xe không được để trống.' })
  @MaxLength(50, { message: 'Biển số xe không được quá 50 ký tự.' })
  plate_number: string;

  @ApiProperty({
    description: 'Hãng xe',
    example: 'Hyundai',
  })
  @IsString({ message: 'Hãng xe phải là chuỗi.' })
  @IsNotEmpty({ message: 'Hãng xe không được để trống.' })
  @MaxLength(100, { message: 'Hãng xe không được quá 100 ký tự.' })
  brand: string;

  @ApiProperty({
    description: 'Trạng thái xe (active, maintenance, inactive)',
    example: 'active',
    required: false,
    enum: ['active', 'maintenance', 'inactive'],
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái xe phải là chuỗi.' })
  @IsIn(['active', 'maintenance', 'inactive'], { message: 'Trạng thái xe không hợp lệ.' })
  status?: string = 'active'; // Đặt giá trị mặc định cho DTO

  @ApiProperty({
    description: 'ID của loại xe (từ vehicle_types)',
    example: 1,
  })
  @IsInt({ message: 'ID loại xe phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID loại xe không được để trống.' })
  vehicle_type_id: number;

  @ApiProperty({
    description: 'ID của sơ đồ ghế (từ seat_layout_templates)',
    example: 1,
  })
  @IsInt({ message: 'ID sơ đồ ghế phải là số nguyên.' })
  @IsNotEmpty({ message: 'ID sơ đồ ghế không được để trống.' })
  seat_layout_template_id: number;

  // company_id sẽ được gán tự động từ người dùng AuthenticatedUser ở service
  // Không cần @ApiProperty hoặc validator ở đây.
}