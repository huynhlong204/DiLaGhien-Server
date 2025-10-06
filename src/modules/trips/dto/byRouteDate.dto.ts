import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, Min } from 'class-validator';

export class FindTripsQueryDto {
    @ApiProperty({ example: 1, description: 'ID tuyến đường của công ty' })
    @Type(() => Number) // ✅ Đây mới là cách chắc chắn
    @IsInt({ message: 'companyRouteId phải là số nguyên' })
    @Min(1)
    companyRouteId: number;

    @ApiProperty({ example: '2025-07-20', description: 'Ngày khởi hành (YYYY-MM-DD)' })
    @IsDateString({}, { message: 'date phải là chuỗi ngày hợp lệ định dạng ISO (YYYY-MM-DD)' })
    date: string;
}