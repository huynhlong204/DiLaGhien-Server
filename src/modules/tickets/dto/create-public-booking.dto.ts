// src/modules/tickets/dto/create-public-booking.dto.ts
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsEmail, ValidateNested, IsOptional, IsArray, IsNumber } from 'class-validator';

// DTO con cho thông tin hành khách
class PassengerInfoDto {
    @IsNotEmpty({ message: 'Họ và tên không được để trống' })
    @IsString()
    fullName: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsString()
    phone: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email: string;
}

// DTO chính cho request đặt vé
export class CreatePublicBookingDto {
    @IsNumber()
    tripId: number;

    @IsArray()
    @IsString({ each: true })
    seats: string[];

    @IsNumber()
    pickupId: number;

    @IsNumber()
    dropoffId: number;

    @ValidateNested()
    @Type(() => PassengerInfoDto)
    passengerInfo: PassengerInfoDto;

    @IsString()
    paymentMethod: string; // 'lenxe'

    // Dùng để xác thực người đang giữ ghế
    @IsString()
    socketId: string;

    @IsNumber()
    totalPrice: number
}