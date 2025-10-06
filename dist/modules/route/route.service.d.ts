import { PrismaService } from '../../prisma/prisma.service';
import { CreateRouteDto, UpdateRouteDto, CreateCompanyRouteDto } from './dto/index.dto';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { routes, company_routes } from '@prisma/client';
export declare class RouteService {
    private prisma;
    constructor(prisma: PrismaService);
    private getRoleId;
    createRoute(createRouteDto: CreateRouteDto, user: AuthenticatedUser): Promise<routes>;
    getAllRoutes(user: AuthenticatedUser): Promise<routes[]>;
    getAllRoutesWithoutCompanyInfo(user: AuthenticatedUser): Promise<routes[]>;
    getOneRoute(id: number, user: AuthenticatedUser): Promise<routes>;
    updateRoute(id: number, updateRouteDto: UpdateRouteDto, user: AuthenticatedUser): Promise<routes>;
    deleteRoute(id: number, user: AuthenticatedUser): Promise<void>;
    assignRouteToCompany(createCompanyRouteDto: CreateCompanyRouteDto, user: AuthenticatedUser): Promise<company_routes>;
    removeCompanyRoute(company_id: number, route_id: number, user: AuthenticatedUser): Promise<void>;
    updateCompanyRouteApproval(companyId: number, routeId: number, approved: boolean, user: AuthenticatedUser): Promise<company_routes>;
    getRoutesByCompanyId(companyId: number, user: AuthenticatedUser): Promise<any[]>;
    requestRouteByCompany(routeId: number, user: AuthenticatedUser): Promise<company_routes>;
    removeMyCompanyRoute(routeId: number, user: AuthenticatedUser): Promise<void>;
}
