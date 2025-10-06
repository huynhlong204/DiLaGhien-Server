"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../auth/enums/role.enum");
let RouteService = class RouteService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRoleId(roleName) {
        const role = await this.prisma.roles.findUnique({
            where: { name: roleName },
            select: { role_id: true },
        });
        if (!role) {
            throw new Error(`Role '${roleName}' not found in database. Please seed roles.`);
        }
        return role.role_id;
    }
    async createRoute(createRouteDto, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo tuyến đường.');
        }
        const { from_location_id, to_location_id } = createRouteDto;
        const fromLocation = await this.prisma.locations.findUnique({ where: { id: from_location_id } });
        const toLocation = await this.prisma.locations.findUnique({ where: { id: to_location_id } });
        if (!fromLocation) {
            throw new common_1.NotFoundException(`Điểm đi với ID ${from_location_id} không tìm thấy.`);
        }
        if (!toLocation) {
            throw new common_1.NotFoundException(`Điểm đến với ID ${to_location_id} không tìm thấy.`);
        }
        const existingRoute = await this.prisma.routes.findFirst({
            where: {
                from_location_id: from_location_id,
                to_location_id: to_location_id,
            },
        });
        if (existingRoute) {
            throw new common_1.BadRequestException(`Tuyến đường từ '${fromLocation.name}' đến '${toLocation.name}' đã tồn tại.`);
        }
        return this.prisma.routes.create({
            data: {
                from_location_id: createRouteDto.from_location_id,
                to_location_id: createRouteDto.to_location_id,
                estimated_time: createRouteDto.estimated_time,
            },
            include: {
                from_location: true,
                to_location: true,
            },
        });
    }
    async getAllRoutes(user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem tất cả tuyến đường.');
        }
        return this.prisma.routes.findMany({
            include: {
                from_location: true,
                to_location: true,
                company_routes: {
                    include: {
                        transport_companies: true,
                    },
                },
            },
        });
    }
    async getAllRoutesWithoutCompanyInfo(user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id !== adminRoleId && user.role_id !== ownerRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem danh sách tuyến đường có sẵn.');
        }
        return this.prisma.routes.findMany({
            include: {
                from_location: true,
                to_location: true,
            },
        });
    }
    async getOneRoute(id, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem chi tiết tuyến đường này.');
        }
        const route = await this.prisma.routes.findUnique({
            where: { id },
            include: {
                from_location: true,
                to_location: true,
                company_routes: {
                    include: {
                        transport_companies: true,
                    },
                },
            },
        });
        if (!route) {
            throw new common_1.NotFoundException(`Tuyến đường với ID ${id} không tìm thấy.`);
        }
        return route;
    }
    async updateRoute(id, updateRouteDto, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật tuyến đường.');
        }
        const existingRoute = await this.prisma.routes.findUnique({ where: { id } });
        if (!existingRoute) {
            throw new common_1.NotFoundException(`Tuyến đường với ID ${id} không tìm thấy.`);
        }
        if (updateRouteDto.from_location_id) {
            const fromLocation = await this.prisma.locations.findUnique({ where: { id: updateRouteDto.from_location_id } });
            if (!fromLocation) {
                throw new common_1.NotFoundException(`Điểm đi với ID ${updateRouteDto.from_location_id} không tìm thấy.`);
            }
        }
        if (updateRouteDto.to_location_id) {
            const toLocation = await this.prisma.locations.findUnique({ where: { id: updateRouteDto.to_location_id } });
            if (!toLocation) {
                throw new common_1.NotFoundException(`Điểm đến với ID ${updateRouteDto.to_location_id} không tìm thấy.`);
            }
        }
        const newFromId = updateRouteDto.from_location_id ?? existingRoute.from_location_id;
        const newToId = updateRouteDto.to_location_id ?? existingRoute.to_location_id;
        if (newFromId !== existingRoute.from_location_id || newToId !== existingRoute.to_location_id) {
            const duplicateRoute = await this.prisma.routes.findFirst({
                where: {
                    from_location_id: newFromId,
                    to_location_id: newToId,
                    NOT: { id: existingRoute.id },
                },
            });
            if (duplicateRoute) {
                throw new common_1.BadRequestException(`Tuyến đường từ ID ${newFromId} đến ID ${newToId} đã tồn tại.`);
            }
        }
        return this.prisma.routes.update({
            where: { id },
            data: updateRouteDto,
            include: {
                from_location: true,
                to_location: true,
            },
        });
    }
    async deleteRoute(id, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa tuyến đường.');
        }
        const existingRoute = await this.prisma.routes.findUnique({ where: { id } });
        if (!existingRoute) {
            throw new common_1.NotFoundException(`Tuyến đường với ID ${id} không tìm thấy.`);
        }
        const companyRoutesCount = await this.prisma.company_routes.count({
            where: { route_id: id }
        });
        if (companyRoutesCount > 0) {
            throw new common_1.BadRequestException(`Không thể xóa tuyến đường này vì nó đang được gán cho ${companyRoutesCount} công ty. Vui lòng gỡ bỏ liên kết trước.`);
        }
        await this.prisma.routes.delete({
            where: { id },
        });
    }
    async assignRouteToCompany(createCompanyRouteDto, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền gán tuyến đường cho công ty.');
        }
        const { company_id, route_id, approved } = createCompanyRouteDto;
        const routeExists = await this.prisma.routes.findUnique({ where: { id: route_id } });
        const companyExists = await this.prisma.transport_companies.findUnique({ where: { id: company_id } });
        if (!routeExists) {
            throw new common_1.NotFoundException(`Tuyến đường với ID ${route_id} không tìm thấy.`);
        }
        if (!companyExists) {
            throw new common_1.NotFoundException(`Công ty với ID ${company_id} không tìm thấy.`);
        }
        const existingCompanyRoute = await this.prisma.company_routes.findUnique({
            where: {
                company_id_route_id: {
                    company_id,
                    route_id,
                },
            },
        });
        if (existingCompanyRoute) {
            return this.prisma.company_routes.update({
                where: {
                    company_id_route_id: {
                        company_id,
                        route_id,
                    },
                },
                data: {
                    approved: approved ?? existingCompanyRoute.approved,
                },
                include: {
                    transport_companies: true,
                    routes: true,
                },
            });
        }
        else {
            return this.prisma.company_routes.create({
                data: {
                    company_id,
                    route_id,
                    approved: approved ?? false,
                },
                include: {
                    transport_companies: true,
                    routes: true,
                },
            });
        }
    }
    async removeCompanyRoute(company_id, route_id, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền gỡ bỏ liên kết tuyến đường khỏi công ty.');
        }
        const companyRoute = await this.prisma.company_routes.findUnique({
            where: {
                company_id_route_id: {
                    company_id,
                    route_id,
                },
            },
            include: {
                trips: {
                    where: { status: { in: ['scheduled', 'active', 'pending'] } },
                },
            },
        });
        if (!companyRoute) {
            throw new common_1.NotFoundException(`Liên kết tuyến đường với công ty (Company ID ${company_id}, Route ID ${route_id}) không tìm thấy.`);
        }
        if (companyRoute.trips.length > 0) {
            throw new common_1.BadRequestException(`Không thể gỡ bỏ tuyến đường này vì có ${companyRoute.trips.length} chuyến đi đang sử dụng hoặc được lên lịch liên quan đến liên kết này.`);
        }
        await this.prisma.company_routes.delete({
            where: {
                company_id_route_id: {
                    company_id,
                    route_id,
                },
            },
        });
    }
    async updateCompanyRouteApproval(companyId, routeId, approved, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật trạng thái duyệt tuyến đường.');
        }
        const companyRoute = await this.prisma.company_routes.findUnique({
            where: {
                company_id_route_id: {
                    company_id: companyId,
                    route_id: routeId,
                },
            },
        });
        if (!companyRoute) {
            throw new common_1.NotFoundException(`Liên kết tuyến đường với công ty (Company ID ${companyId}, Route ID ${routeId}) không tìm thấy.`);
        }
        return this.prisma.company_routes.update({
            where: {
                company_id_route_id: {
                    company_id: companyId,
                    route_id: routeId,
                },
            },
            data: {
                approved: approved,
            },
            include: {
                transport_companies: true,
                routes: true,
            },
        });
    }
    async getRoutesByCompanyId(companyId, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === ownerRoleId) {
            if (user.company_id === null || user.company_id !== companyId) {
                throw new common_1.ForbiddenException('Bạn không có quyền xem tuyến đường của công ty này.');
            }
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem tuyến đường của công ty.');
        }
        const companyRoutes = await this.prisma.company_routes.findMany({
            where: {
                company_id: companyId,
            },
            include: {
                routes: {
                    include: {
                        from_location: true,
                        to_location: true,
                    },
                },
                transport_companies: true,
            },
        });
        return companyRoutes.map(cr => ({
            ...cr.routes,
            approved: cr.approved,
            companyRouteId: cr.id,
        }));
    }
    async requestRouteByCompany(routeId, user) {
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id !== ownerRoleId || user.company_id === null) {
            throw new common_1.ForbiddenException('Bạn không có quyền yêu cầu tuyến đường hoặc không thuộc về một công ty.');
        }
        const routeExists = await this.prisma.routes.findUnique({ where: { id: routeId } });
        if (!routeExists) {
            throw new common_1.NotFoundException(`Tuyến đường với ID ${routeId} không tìm thấy.`);
        }
        const existingCompanyRoute = await this.prisma.company_routes.findUnique({
            where: {
                company_id_route_id: {
                    company_id: user.company_id,
                    route_id: routeId,
                },
            },
        });
        if (existingCompanyRoute) {
            throw new common_1.BadRequestException('Công ty của bạn đã yêu cầu hoặc đã được gán tuyến đường này rồi.');
        }
        return this.prisma.company_routes.create({
            data: {
                company_id: user.company_id,
                route_id: routeId,
                approved: false,
            },
            include: {
                transport_companies: true,
                routes: true,
            },
        });
    }
    async removeMyCompanyRoute(routeId, user) {
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id !== ownerRoleId || user.company_id === null) {
            throw new common_1.ForbiddenException('Bạn không có quyền gỡ bỏ tuyến đường này hoặc không thuộc về một công ty.');
        }
        const companyRoute = await this.prisma.company_routes.findUnique({
            where: {
                company_id_route_id: {
                    company_id: user.company_id,
                    route_id: routeId,
                },
            },
            include: {
                trips: {
                    where: { status: { in: ['scheduled', 'active', 'pending'] } },
                },
            },
        });
        if (!companyRoute) {
            throw new common_1.NotFoundException(`Tuyến đường ID ${routeId} không được gán cho công ty của bạn.`);
        }
        if (companyRoute.trips.length > 0) {
            throw new common_1.BadRequestException(`Không thể gỡ bỏ tuyến đường này vì có ${companyRoute.trips.length} chuyến đi đang sử dụng hoặc được lên lịch liên quan đến công ty của bạn.`);
        }
        await this.prisma.company_routes.delete({
            where: {
                company_id_route_id: {
                    company_id: user.company_id,
                    route_id: routeId,
                },
            },
        });
    }
};
exports.RouteService = RouteService;
exports.RouteService = RouteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RouteService);
//# sourceMappingURL=route.service.js.map