import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findOne(id: number): Promise<{
        trips: {
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
        };
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
    }>;
    update(id: number, updateTicketDto: UpdateTicketDto): Promise<{
        trips: {
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
        };
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
    }>;
    getTicketsByTrip(tripId: number): Promise<{
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
        } & {
            company_id: number;
            created_at: Date;
            id: number;
            route_id: number;
            approved: boolean;
        };
    }>;
    createManualTicket(createTicketDto: CreateTicketDto): Promise<{
        message: string;
        ticket: {
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
        };
    }>;
    cancelTicket(id: number): Promise<{
        trips: {
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
        };
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
    }>;
    createPublicBooking(createPublicBookingDto: CreatePublicBookingDto, req: any): Promise<{
        message: string;
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
    }>;
}
