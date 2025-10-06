import { CompanyRouteStopsService } from './company-route-stop.service';
import { CreateCompanyRouteStopDto } from './dto/create-company-route-stop.dto';
import { UpdateCompanyRouteStopDto } from './dto/update-company-route-stop.dto';
export declare class CompanyRouteStopsController {
    private readonly companyRouteStopsService;
    constructor(companyRouteStopsService: CompanyRouteStopsService);
    create(createCompanyRouteStopDto: CreateCompanyRouteStopDto): Promise<{
        id: number;
        company_route_id: number;
        location_id: number;
        stop_order: number;
        is_pickup_point: boolean;
        is_dropoff_point: boolean;
        time_offset_minutes: number | null;
    }>;
    findAll(): Promise<({
        company_route: {
            company_id: number;
            created_at: Date;
            id: number;
            route_id: number;
            approved: boolean;
        };
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
    })[]>;
    findByCompanyRouteId(companyRouteId: number): Promise<({
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
    })[]>;
    findOne(id: number): Promise<{
        company_route: {
            company_id: number;
            created_at: Date;
            id: number;
            route_id: number;
            approved: boolean;
        };
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
    }>;
    update(id: number, updateCompanyRouteStopDto: UpdateCompanyRouteStopDto): Promise<{
        id: number;
        company_route_id: number;
        location_id: number;
        stop_order: number;
        is_pickup_point: boolean;
        is_dropoff_point: boolean;
        time_offset_minutes: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
