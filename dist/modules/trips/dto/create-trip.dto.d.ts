import { TripStatus } from '../enums/trip-status.enum';
export declare class CreateTripDto {
    company_route_id: number;
    vehicle_id?: number | null;
    departure_time: string;
    price_default: number;
    status: TripStatus;
    seat_layout_templatesId?: number | null;
    driver_id?: number | null;
    vehicle_type_id?: number | null;
}
