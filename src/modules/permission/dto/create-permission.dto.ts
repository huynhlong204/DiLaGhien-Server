// src/permissions/dto/create-permission.dto.ts

import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Thêm moduleId vào đây
  @IsInt()
  @IsNotEmpty()
  module_id: number;

  @IsOptional()
  @IsInt()
  bit_value: number;

  @IsOptional()
  @IsString()
  description?: string;
}