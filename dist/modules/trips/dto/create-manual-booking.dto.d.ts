declare class CustomerInfoDto {
    name: string;
    email: string;
    phone: string;
}
declare class PaymentInfoDto {
    amount: number;
    method: string;
}
export declare class CreateManualBookingDto {
    tripId: number;
    seatCode: string;
    customerInfo: CustomerInfoDto;
    paymentInfo: PaymentInfoDto;
}
export {};
