import { RouteService } from './route.service';
import { CreateRouteDto, UpdateRouteDto, CreateCompanyRouteDto } from './dto/index.dto';
import { Request } from 'express';
export declare class RouteController {
    private readonly routeService;
    constructor(routeService: RouteService);
    requestRouteByCompany(routeId: number, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        id: number;
        route_id: number;
        approved: boolean;
    }>;
    getMyCompanyRoutes(req: Request): Promise<any[]>;
    removeMyCompanyRoute(routeId: number, req: Request): Promise<void>;
    getAllAvailableRoutes(req: Request): Promise<{
        id: number;
        from_location_id: number;
        to_location_id: number;
        estimated_time: string;
    }[]>;
    create(createRouteDto: CreateRouteDto, req: Request): Promise<{
        id: number;
        from_location_id: number;
        to_location_id: number;
        estimated_time: string;
    }>;
    getAllRoutesForAdmin(req: Request, companyId?: number): Promise<any[]>;
    getOne(id: number, req: Request): Promise<{
        id: number;
        from_location_id: number;
        to_location_id: number;
        estimated_time: string;
    }>;
    update(id: number, updateRouteDto: UpdateRouteDto, req: Request): Promise<{
        id: number;
        from_location_id: number;
        to_location_id: number;
        estimated_time: string;
    }>;
    delete(id: number, req: Request): Promise<void>;
    assignRouteToCompany(createCompanyRouteDto: CreateCompanyRouteDto, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        id: number;
        route_id: number;
        approved: boolean;
    }>;
    removeCompanyRoute(companyId: number, routeId: number, req: Request): Promise<void>;
    updateApprovalStatus(companyId: number, routeId: number, approved: boolean, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        id: number;
        route_id: number;
        approved: boolean;
    }>;
}
