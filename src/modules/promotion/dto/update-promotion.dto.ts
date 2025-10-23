// src/promotion/dto/update-promotion.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePromotionDto } from './create-promotion.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
    // Cho phép cập nhật code, nhưng cần cẩn thận vì nó là unique
    @IsOptional()
    @IsString()
    code?: string;
}