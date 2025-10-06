import { IsString, IsEmail, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsInt()
  role_id: number;

  @IsOptional()
  @IsInt()
  company_id?: number;

  @IsOptional()
  @IsString()
  phone?: string;
}