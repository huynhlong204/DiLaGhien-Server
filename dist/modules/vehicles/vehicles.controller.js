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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const vehicles_service_1 = require("./vehicles.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_enum_1 = require("../../auth/enums/role.enum");
let VehiclesController = class VehiclesController {
    vehiclesService;
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    async create(createVehicleDto, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.vehiclesService.create(createVehicleDto, req.user);
    }
    async findAll(req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.vehiclesService.findAll(req.user);
    }
    async findOne(id, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.vehiclesService.findOne(+id, req.user);
    }
    async update(id, updateVehicleDto, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.vehiclesService.update(+id, updateVehicleDto, req.user);
    }
    async remove(id, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        await this.vehiclesService.remove(+id, req.user);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo một xe mới cho công ty của Owner (Owner Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Xe đã được tạo thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc biển số xe đã tồn tại, ID không hợp lệ.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả các xe (Admin xem tất cả, Owner xem của công ty mình)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về danh sách các xe.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy một xe theo ID (Admin xem bất kỳ, Owner xem của công ty mình)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về thông tin xe.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy xe.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin xe (Admin cập nhật bất kỳ, Owner cập nhật của công ty mình)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Xe đã được cập nhật thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc lỗi liên kết ID.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy xe.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_dto_1.UpdateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa một xe (Admin xóa bất kỳ, Owner xóa của công ty mình)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Xe đã được xóa thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không thể xóa vì xe đang được sử dụng.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy xe.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles (Owner & Admin)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map