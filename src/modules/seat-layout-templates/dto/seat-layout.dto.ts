// src/common/dto/seat-layout.dto.ts
import { IsString, IsNotEmpty, IsInt, Min, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Các loại ghế (Seat Types) được dùng trong enum
const SEAT_TYPES = ["standard", "vip", "aisle", "disabled", "empty", "bed", "room", "vip_room", "double_room"] as const;
type SeatType = typeof SEAT_TYPES[number];

export class SeatDto {
  @ApiProperty({ description: 'Row number of the seat', example: 1 })
  @IsInt({ message: 'Hàng phải là số nguyên.' })
  @Min(1, { message: 'Hàng phải lớn hơn 0.' })
  row: number;

  @ApiProperty({ description: 'Column number of the seat', example: 1 })
  @IsInt({ message: 'Cột phải là số nguyên.' })
  @Min(1, { message: 'Cột phải lớn hơn 0.' })
  col: number;

  @ApiProperty({ description: 'Seat number (e.g., A1, B10)', example: 'A1' })
  @IsString({ message: 'Số hiệu ghế phải là chuỗi.' })
  @IsNotEmpty({ message: 'Số hiệu ghế không được để trống.' })
  number: string;

  @ApiProperty({
    description: 'Type of the seat',
    enum: SEAT_TYPES,
    example: 'standard'
  })
  @IsEnum(SEAT_TYPES, { message: 'Loại ghế không hợp lệ.' })
  @IsNotEmpty({ message: 'Loại ghế không được để trống.' })
  type: SeatType;
}

export class SectionDto {
  @ApiProperty({ description: 'Unique ID for the section', example: 'F1S1' })
  @IsString({ message: 'ID khu vực phải là chuỗi.' })
  @IsNotEmpty({ message: 'ID khu vực không được để trống.' })
  section_id: string;

  @ApiProperty({ description: 'Name of the section', example: 'Khu vực Tầng 1' })
  @IsString({ message: 'Tên khu vực phải là chuỗi.' })
  @IsNotEmpty({ message: 'Tên khu vực không được để trống.' })
  name: string;

  @ApiProperty({ description: 'Number of rows in the section grid', example: 7 })
  @IsInt({ message: 'Số hàng phải là số nguyên.' })
  @Min(1, { message: 'Số hàng phải lớn hơn 0.' })
  rows: number;

  @ApiProperty({ description: 'Number of columns in the section grid', example: 5 })
  @IsInt({ message: 'Số cột phải là số nguyên.' })
  @Min(1, { message: 'Số cột phải lớn hơn 0.' })
  cols: number;

  @ApiProperty({ type: [SeatDto], description: 'List of seats in this section' })
  @IsArray({ message: 'Ghế phải là một mảng.' })
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];
}

export class FloorDto {
  @ApiProperty({ description: 'Floor number', example: 1 })
  @IsInt({ message: 'Số tầng phải là số nguyên.' })
  @Min(1, { message: 'Số tầng phải lớn hơn 0.' })
  floor_number: number;

  @ApiProperty({ description: 'Name of the floor', example: 'Tầng 1' })
  @IsString({ message: 'Tên tầng phải là chuỗi.' })
  @IsNotEmpty({ message: 'Tên tầng không được để trống.' })
  name: string;

  @ApiProperty({ type: [SectionDto], description: 'List of sections on this floor' })
  @IsArray({ message: 'Các khu vực phải là một mảng.' })
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];
}

export class SeatLayoutDataDto {
  @ApiProperty({ description: 'Total capacity of seats in the layout', example: 45 })
  @IsInt({ message: 'Tổng số ghế phải là số nguyên.' })
  @Min(0, { message: 'Tổng số ghế không thể âm.' })
  total_capacity: number;

  @ApiProperty({ type: [FloorDto], description: 'List of floors in the seat layout' })
  @IsArray({ message: 'Các tầng phải là một mảng.' })
  @ValidateNested({ each: true })
  @Type(() => FloorDto)
  floors: FloorDto[];

  // THÊM CHỮ KÝ CHỈ MỤC NÀY VÀO ĐÂY ĐỂ GIẢI QUYẾT LỖI PRISMA
  [key: string]: any; 
}