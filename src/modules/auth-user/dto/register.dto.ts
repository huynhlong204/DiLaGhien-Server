import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ.' })
    email: string;

    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Vui lòng nhập họ và tên.' })
    name: string;

    @IsString()
    @IsOptional()
    phone: string;
}