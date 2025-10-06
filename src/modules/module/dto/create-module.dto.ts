import { IsString, IsOptional } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}