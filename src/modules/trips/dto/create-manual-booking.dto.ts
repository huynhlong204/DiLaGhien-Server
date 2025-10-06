// src/trips/dto/create-manual-booking.dto.ts
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsEmail, ValidateNested } from 'class-validator';

class CustomerInfoDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone: string;
}

class PaymentInfoDto {
    @IsNumber()
    amount: number;

    @IsString()
    method: string; // 'cash', 'transfer'
}

export class CreateManualBookingDto {
    @IsNumber()
    tripId: number;

    @IsString()
    seatCode: string;

    @ValidateNested()
    @Type(() => CustomerInfoDto)
    customerInfo: CustomerInfoDto;

    @ValidateNested()
    @Type(() => PaymentInfoDto)
    paymentInfo: PaymentInfoDto;
}