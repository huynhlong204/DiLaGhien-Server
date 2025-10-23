// src/promotion/dto/create-promotion.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, IsDateString, IsBoolean, IsInt, IsUrl } from 'class-validator';

export class CreatePromotionDto {
    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsUrl()
    image_url?: string;

    @IsEnum(['percentage', 'fixed_amount'])
    @IsNotEmpty()
    discount_type: 'percentage' | 'fixed_amount';

    @IsNumber()
    @Min(0)
    discount_value: number;

    @IsDateString()
    @IsNotEmpty()
    valid_from: string; // ISO 8601 format (e.g., "2025-12-31T17:00:00.000Z")

    @IsDateString()
    @IsNotEmpty()
    valid_to: string; // ISO 8601 format

    @IsOptional()
    @IsBoolean()
    is_active?: boolean = true;

    @IsOptional()
    @IsInt()
    @Min(1)
    usage_limit?: number;

    // company_id sẽ được set tự động trong service dựa vào user, không cần validate ở đây
}