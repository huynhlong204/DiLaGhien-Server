// src/customers/dto/update-customer.dto.ts
import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCustomerDto {
    @ApiProperty({ required: false, description: 'Tên mới của khách hàng' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false, description: 'Email mới của khách hàng' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ required: false, description: 'Số điện thoại mới của khách hàng' })
    @IsPhoneNumber('VN') // Hoặc bỏ trống nếu không yêu cầu SĐT Việt Nam
    @IsOptional()
    phone?: string;
}