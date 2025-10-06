import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsEmail, ValidateNested, IsOptional } from 'class-validator';

class CustomerInfoDto {
    @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
    @IsString()
    name: string;

    @IsOptional()
    @IsEmail({}, { message: 'Email không hợp lệ' })
    email?: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
    @IsString()
    phone: string;
}

class PaymentInfoDto {
    @IsNumber()
    amount: number;

    @IsString()
    method: string; // 'cash', 'transfer'

    @IsString()
    status: string; // Trạng thái thanh toán, ví dụ: 'completed', '
}

export class CreateTicketDto {
    @IsNumber()
    tripId: number;

    @IsString()
    seatCode: string;

    @IsString()
    note?: string;

    @IsString()
    status: string; // Trạng thái vé, ví dụ: 'PAID', '

    @IsOptional()
    @ValidateNested()
    @Type(() => CustomerInfoDto)
    customerInfo: CustomerInfoDto;

    @ValidateNested()
    @Type(() => PaymentInfoDto)
    paymentInfo: PaymentInfoDto;
}