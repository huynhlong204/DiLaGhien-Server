import { AuthUserService } from './auth-user.service';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class AuthUserController {
    private authUserService;
    constructor(authUserService: AuthUserService);
    register(registerDto: RegisterDto): Promise<{
        email: string;
        phone: string | null;
        created_at: Date;
        updated_at: Date;
        customer_id: number;
        refresh_token_hash: string | null;
    }>;
    login(req: any, res: Response): Promise<any>;
    logout(req: any, res: Response): Promise<{
        message: string;
    }>;
    refreshTokens(req: any, res: Response): Promise<{
        message: string;
    }>;
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: any, res: Response): Promise<void>;
    getProfile(req: any): Promise<{
        customer_profiles: {
            created_at: Date;
            updated_at: Date;
            name: string;
            id: number;
            avatar_url: string | null;
            address: string | null;
            customer_id: number;
            gender: boolean | null;
            dateOfBirth: Date | null;
        } | null;
        email: string;
        phone: string | null;
        customer_id: number;
    }>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<{
        customer_profiles: {
            created_at: Date;
            updated_at: Date;
            name: string;
            id: number;
            avatar_url: string | null;
            address: string | null;
            customer_id: number;
            gender: boolean | null;
            dateOfBirth: Date | null;
        } | null;
        email: string;
        phone: string | null;
        customer_id: number;
    }>;
    getTicketOfUser(req: any): Promise<{
        customers: {
            email: string;
            password_hash: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            customer_id: number;
            refresh_token_hash: string | null;
        } | null;
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
        payments: {
            id: number;
            status: string;
            ticket_id: number;
            method: string;
            amount: number;
            transaction_id: string;
            payment_time: Date;
        }[];
        shuttle_requests: {
            id: number;
            status: string;
            ticket_id: number;
            pickup_location_id: number;
            dropoff_location_id: number;
        }[];
        _count: {
            payments: number;
            shuttle_requests: number;
            customers: number;
            trips: number;
            ticket_details: number;
        };
        id: number;
        code: string;
        status: string;
        trip_id: number;
        customer_id: number | null;
        seat_code: string;
        booking_time: Date;
        note: string | null;
    }[]>;
    getTicketByCode(req: any, code: string): Promise<{
        customers: {
            email: string;
            password_hash: string | null;
            phone: string | null;
            created_at: Date;
            updated_at: Date;
            customer_id: number;
            refresh_token_hash: string | null;
        } | null;
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
        payments: {
            id: number;
            status: string;
            ticket_id: number;
            method: string;
            amount: number;
            transaction_id: string;
            payment_time: Date;
        }[];
        shuttle_requests: {
            id: number;
            status: string;
            ticket_id: number;
            pickup_location_id: number;
            dropoff_location_id: number;
        }[];
        _count: {
            payments: number;
            shuttle_requests: number;
            customers: number;
            trips: number;
            ticket_details: number;
        };
        id: number;
        code: string;
        status: string;
        trip_id: number;
        customer_id: number | null;
        seat_code: string;
        booking_time: Date;
        note: string | null;
    }>;
}
