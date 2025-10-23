// src/promotion/dto/find-promotions-query.dto.ts
import { IsOptional, IsString, IsInt, Min, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FindPromotionsQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number) // Chuyển đổi string từ query param thành number
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string; // Tìm theo code hoặc description

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean) // Chuyển đổi 'true'/'false' thành boolean
    is_active?: boolean;

    @IsOptional()
    @IsEnum(['active', 'upcoming', 'expired']) // Lọc theo trạng thái thời gian
    status?: 'active' | 'upcoming' | 'expired';

    // company_id sẽ được xử lý trong service
}