// src/auth-user/dto/update-user.dto.ts
import { IsString, IsOptional, IsDateString, IsBoolean, IsUrl } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    // --- THAY ĐỔI TẠI ĐÂY ---
    @IsOptional()
    @IsBoolean({ message: 'Giới tính phải là giá trị boolean.' })
    gender?: boolean; // Chuyển từ string sang boolean

    @IsOptional()
    @IsDateString({}, { message: 'Ngày sinh phải là định dạng ngày hợp lệ.' })
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsUrl({}, { message: 'Avatar URL không hợp lệ.' })
    avatar_url?: string;
}