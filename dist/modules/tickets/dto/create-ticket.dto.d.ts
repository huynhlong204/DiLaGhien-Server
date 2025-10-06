declare class CustomerInfoDto {
    name: string;
    email?: string;
    phone: string;
}
declare class PaymentInfoDto {
    amount: number;
    method: string;
    status: string;
}
export declare class CreateTicketDto {
    tripId: number;
    seatCode: string;
    note?: string;
    status: string;
    customerInfo: CustomerInfoDto;
    paymentInfo: PaymentInfoDto;
}
export {};
