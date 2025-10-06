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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteController = void 0;
const common_1 = require("@nestjs/common");
const route_service_1 = require("./route.service");
const index_dto_1 = require("./dto/index.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_enum_1 = require("../../auth/enums/role.enum");
let RouteController = class RouteController {
    routeService;
    constructor(routeService) {
        this.routeService = routeService;
    }
    async requestRouteByCompany(routeId, req) {
        return this.routeService.requestRouteByCompany(routeId, req.user);
    }
    async getMyCompanyRoutes(req) {
        const user = req.user;
        console.log(user);
        if (!user.company_id) {
            throw new common_1.UnauthorizedException('Thông tin công ty không tìm thấy trong token.');
        }
        return this.routeService.getRoutesByCompanyId(user.company_id, user);
    }
    async removeMyCompanyRoute(routeId, req) {
        return this.routeService.removeMyCompanyRoute(routeId, req.user);
    }
    async getAllAvailableRoutes(req) {
        return this.routeService.getAllRoutesWithoutCompanyInfo(req.user);
    }
    async create(createRouteDto, req) {
        return this.routeService.createRoute(createRouteDto, req.user);
    }
    async getAllRoutesForAdmin(req, companyId) {
        if (companyId !== undefined) {
            return this.routeService.getRoutesByCompanyId(companyId, req.user);
        }
        else {
            return this.routeService.getAllRoutes(req.user);
        }
    }
    async getOne(id, req) {
        return this.routeService.getOneRoute(id, req.user);
    }
    async update(id, updateRouteDto, req) {
        return this.routeService.updateRoute(id, updateRouteDto, req.user);
    }
    async delete(id, req) {
        return this.routeService.deleteRoute(id, req.user);
    }
    async assignRouteToCompany(createCompanyRouteDto, req) {
        return this.routeService.assignRouteToCompany(createCompanyRouteDto, req.user);
    }
    async removeCompanyRoute(companyId, routeId, req) {
        return this.routeService.removeCompanyRoute(companyId, routeId, req.user);
    }
    async updateApprovalStatus(companyId, routeId, approved, req) {
        return this.routeService.updateCompanyRouteApproval(companyId, routeId, approved, req.user);
    }
};
exports.RouteController = RouteController;
__decorate([
    (0, common_1.Post)('company/request'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.OWNER),
    __param(0, (0, common_1.Body)('route_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "requestRouteByCompany", null);
__decorate([
    (0, common_1.Get)('company/my-routes'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.OWNER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "getMyCompanyRoutes", null);
__decorate([
    (0, common_1.Delete)('company/my-routes/:routeId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('routeId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "removeMyCompanyRoute", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "getAllAvailableRoutes", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_dto_1.CreateRouteDto, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('companyId', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "getAllRoutesForAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, index_dto_1.UpdateRouteDto, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('assign'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_dto_1.CreateCompanyRouteDto, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "assignRouteToCompany", null);
__decorate([
    (0, common_1.Delete)(':companyId/:routeId'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('routeId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "removeCompanyRoute", null);
__decorate([
    (0, common_1.Patch)(':companyId/:routeId/approve'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('routeId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('approved')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Boolean, Object]),
    __metadata("design:returntype", Promise)
], RouteController.prototype, "updateApprovalStatus", null);
exports.RouteController = RouteController = __decorate([
    (0, common_1.Controller)('routes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [route_service_1.RouteService])
], RouteController);
//# sourceMappingURL=route.controller.js.map