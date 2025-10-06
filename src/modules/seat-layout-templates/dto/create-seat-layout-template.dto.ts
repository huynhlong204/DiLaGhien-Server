// src/seat-layout-templates/dto/create-seat-layout-template.dto.ts
import { IsString, IsNotEmpty, IsInt, Min, IsOptional, MaxLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SeatLayoutDataDto } from './seat-layout.dto';

export class CreateSeatLayoutTemplateDto {
  @ApiProperty({
    description: 'Tên sơ đồ ghế',
    example: 'Sơ đồ xe 45 chỗ',
  })
  @IsString({ message: 'Tên sơ đồ ghế phải là chuỗi.' })
  @IsNotEmpty({ message: 'Tên sơ đồ ghế không được để trống.' })
  @MaxLength(255, { message: 'Tên sơ đồ ghế không được quá 255 ký tự.' })
  name: string;

  @ApiProperty({
    description: 'Tổng số ghế trong sơ đồ',
    example: 45,
  })
  @IsInt({ message: 'Số lượng ghế phải là số nguyên.' })
  @Min(1, { message: 'Số lượng ghế phải lớn hơn 0.' })
  seat_count: number;

  @ApiProperty({
    description: 'Mô tả chi tiết về sơ đồ ghế',
    example: 'Sơ đồ ghế tiêu chuẩn cho xe khách 45 chỗ.',
    required: false,
  })
  @IsString({ message: 'Mô tả phải là chuỗi.' })
  @IsOptional()
  description?: string;

  // Đảm bảo trường này ĐANG TỒN TẠI và được khai báo đúng
  @ApiProperty({
    description: 'Dữ liệu chi tiết về sơ đồ ghế (cấu trúc JSON)',
    type: SeatLayoutDataDto, // Sử dụng DTO đã định nghĩa trong seat-layout.dto.ts
  })
  @ValidateNested() // Quan trọng để validate các trường con bên trong `layout_data`
  @Type(() => SeatLayoutDataDto) // Quan trọng để class-transformer có thể chuyển đổi dữ liệu JSON thành instance của SeatLayoutDataDto
  @IsNotEmpty({ message: 'Dữ liệu sơ đồ ghế không được để trống.' })
  layout_data: SeatLayoutDataDto;
}