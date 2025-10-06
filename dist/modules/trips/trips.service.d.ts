import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto, UpdateTripDto, CreateRecurringTripDto } from './dto/index.dto';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { TripStatus } from './enums/trip-status.enum';
import { trips } from '@prisma/client';
export declare class TripService {
    private prisma;
    constructor(prisma: PrismaService);
    private getRoleId;
    private checkOwnerCompanyAccess;
    private validateTripAssociations;
    create(createTripDto: CreateTripDto, user: AuthenticatedUser): Promise<trips>;
    createRecurring(createRecurringTripDto: CreateRecurringTripDto, user: AuthenticatedUser): Promise<trips[]>;
    findAll(user: AuthenticatedUser): Promise<trips[]>;
    findOne(id: number, user: AuthenticatedUser): Promise<trips>;
    update(id: number, updateTripDto: UpdateTripDto, user: AuthenticatedUser): Promise<trips>;
    updateTripStatus(id: number, status: TripStatus, user: AuthenticatedUser): Promise<trips>;
    remove(id: number, user: AuthenticatedUser): Promise<void>;
    findBookingsByTrip(tripId: number): Promise<{
        customers: {
            customer_profiles: {
                name: string;
            } | null;
            phone: string | null;
        } | null;
        id: number;
        status: string;
        seat_code: string;
    }[]>;
    findTripsByRouteAndDate(company_route_id: number, date: string): Promise<({
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
            company_id: number;
            created_at: Date;
            id: number;
            route_id: number;
            approved: boolean;
        };
        driver: {
            user_id: number;
            email: string;
            password_hash: string;
            role_id: number;
            company_id: number | null;
            phone: string;
            created_at: Date;
            updated_at: Date;
        } | null;
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
}
