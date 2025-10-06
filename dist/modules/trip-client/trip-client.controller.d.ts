import { TripClientService, FindTripsQueryDto } from './trip-client.service';
export declare class TripClientController {
    private readonly tripClientService;
    constructor(tripClientService: TripClientService);
    findAll(query: FindTripsQueryDto): Promise<({
        vehicles: ({
            vehicle_type: {
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
                id: number;
            } | null;
            seat_layout_template: {
                company_id: number;
                created_at: Date;
                updated_at: Date;
                name: string;
                description: string | null;
                id: number;
                seat_count: number;
                layout_data: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
        } & {
            company_id: number;
            created_at: Date;
            updated_at: Date;
            id: number;
            vehicle_type_id: number | null;
            status: string;
            plate_number: string;
            brand: string;
            seat_layout_template_id: number | null;
        }) | null;
        tickets: {
            id: number;
            code: string;
            status: string;
            trip_id: number;
            customer_id: number | null;
            seat_code: string;
            booking_time: Date;
            note: string | null;
        }[];
        company_route: {
            transport_companies: {
                created_at: Date;
                name: string;
                id: number;
                avatar_url: string | null;
                tax_code: string;
                address: string;
                contact_person: string;
                db_connection_string: string | null;
            };
            routes: {
                from_location: {
                    name: string;
                    id: number;
                    address: string;
                    province: string | null;
                    commune: string | null;
                    locationType: string | null;
                    map_url: string | null;
                };
                to_location: {
                    name: string;
                    id: number;
                    address: string;
                    province: string | null;
                    commune: string | null;
                    locationType: string | null;
                    map_url: string | null;
                };
            } & {
                id: number;
                from_location_id: number;
                to_location_id: number;
                estimated_time: string;
            };
            stops: ({
                location: {
                    name: string;
                    id: number;
                    address: string;
                    province: string | null;
                    commune: string | null;
                    locationType: string | null;
                    map_url: string | null;
                };
            } & {
                id: number;
                company_route_id: number;
                location_id: number;
                stop_order: number;
                is_pickup_point: boolean;
                is_dropoff_point: boolean;
                time_offset_minutes: number | null;
            })[];
        } & {
            company_id: number;
            created_at: Date;
            id: number;
            route_id: number;
            approved: boolean;
        };
    } & {
        id: number;
        company_route_id: number;
        vehicle_type_id: number | null;
        vehicle_id: number | null;
        driver_id: number | null;
        departure_time: Date;
        price_default: number;
        status: string;
        transport_companiesId: number | null;
        seat_layout_templatesId: number | null;
        routesId: number | null;
    })[]>;
    getTripDetailsForBooking(id: number): Promise<{
        seat_layout_templates: {
            company_id: number;
            created_at: Date;
            updated_at: Date;
            name: string;
            description: string | null;
            id: number;
            seat_count: number;
            layout_data: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        tickets: ({
            ticket_details: {
                id: number;
                passenger_name: string;
                passenger_phone: string;
                passenger_email: string | null;
                ticket_id: number;
            } | null;
        } & {
            id: number;
            code: string;
            status: string;
            trip_id: number;
            customer_id: number | null;
            seat_code: string;
            booking_time: Date;
            note: string | null;
        })[];
        id: number;
        departure_time: Date;
        price_default: number;
        status: string;
        company_route: {
            transport_companies: {
                created_at: Date;
                name: string;
                id: number;
                avatar_url: string | null;
                tax_code: string;
                address: string;
                contact_person: string;
                db_connection_string: string | null;
            };
            routes: {
                from_location: {
                    name: string;
                    id: number;
                    address: string;
                    province: string | null;
                    commune: string | null;
                    locationType: string | null;
                    map_url: string | null;
                };
                to_location: {
                    name: string;
                    id: number;
                    address: string;
                    province: string | null;
                    commune: string | null;
                    locationType: string | null;
                    map_url: string | null;
                };
            } & {
                id: number;
                from_location_id: number;
                to_location_id: number;
                estimated_time: string;
            };
            stops: ({
                location: {
                    name: string;
                    id: number;
                    address: string;
                    province: string | null;
                    commune: string | null;
                    locationType: string | null;
                    map_url: string | null;
                };
            } & {
                id: number;
                company_route_id: number;
                location_id: number;
                stop_order: number;
                is_pickup_point: boolean;
                is_dropoff_point: boolean;
                time_offset_minutes: number | null;
            })[];
        } & {
            company_id: number;
            created_at: Date;
            id: number;
            route_id: number;
            approved: boolean;
        };
    }>;
}
