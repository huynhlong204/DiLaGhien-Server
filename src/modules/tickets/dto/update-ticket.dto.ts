import { IsEnum, IsOptional, IsString } from 'class-validator';


export class UpdateTicketDto {
    @IsOptional() @IsString() passenger_name?: string;
    @IsOptional() @IsString() passenger_phone?: string;
    @IsOptional() @IsString() passenger_email?: string;
    @IsOptional() @IsString() note?: string;
    @IsOptional() @IsString() status?: string;
}