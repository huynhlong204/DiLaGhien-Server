import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  bit_value: number;

  @IsOptional()
  @IsString()
  description?: string;
}