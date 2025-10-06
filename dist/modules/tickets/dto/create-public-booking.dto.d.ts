declare class PassengerInfoDto {
    fullName: string;
    phone: string;
    email: string;
}
export declare class CreatePublicBookingDto {
    tripId: number;
    seats: string[];
    pickupId: number;
    dropoffId: number;
    passengerInfo: PassengerInfoDto;
    paymentMethod: string;
    socketId: string;
}
export {};
