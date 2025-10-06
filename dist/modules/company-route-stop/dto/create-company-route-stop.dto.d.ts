export declare class CreateCompanyRouteStopDto {
    company_route_id: number;
    location_id: number;
    stop_order: number;
    is_pickup_point?: boolean;
    is_dropoff_point?: boolean;
    time_offset_minutes?: number;
}
