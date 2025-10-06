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
exports.VehicleTypesController = void 0;
const common_1 = require("@nestjs/common");
const vehicle_types_service_1 = require("./vehicle-types.service");
const create_vehicle_type_dto_1 = require("./dto/create-vehicle-type.dto");
const update_vehicle_type_dto_1 = require("./dto/update-vehicle-type.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_enum_1 = require("../../auth/enums/role.enum");
let VehicleTypesController = class VehicleTypesController {
    vehicleTypesService;
    constructor(vehicleTypesService) {
        this.vehicleTypesService = vehicleTypesService;
    }
    async create(createVehicleTypeDto) {
        return this.vehicleTypesService.create(createVehicleTypeDto);
    }
    async findAll() {
        return this.vehicleTypesService.findAll();
    }
    async findOne(id) {
        return this.vehicleTypesService.findOne(+id);
    }
    async update(id, updateVehicleTypeDto) {
        return this.vehicleTypesService.update(+id, updateVehicleTypeDto);
    }
    async remove(id) {
        await this.vehicleTypesService.remove(+id);
    }
};
exports.VehicleTypesController = VehicleTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo một loại xe mới (Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Loại xe đã được tạo thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tên loại xe đã tồn tại.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_type_dto_1.CreateVehicleTypeDto]),
    __metadata("design:returntype", Promise)
], VehicleTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả các loại xe' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về danh sách các loại xe.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehicleTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy một loại xe theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về thông tin loại xe.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy loại xe.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin loại xe (Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Loại xe đã được cập nhật thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tên loại xe đã tồn tại.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy loại xe.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_type_dto_1.UpdateVehicleTypeDto]),
    __metadata("design:returntype", Promise)
], VehicleTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa một loại xe (Admin Only)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Loại xe đã được xóa thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không thể xóa vì có xe đang sử dụng loại này.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy loại xe.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehicleTypesController.prototype, "remove", null);
exports.VehicleTypesController = VehicleTypesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Types (Admin Only)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('vehicle-types'),
    __metadata("design:paramtypes", [vehicle_types_service_1.VehicleTypesService])
], VehicleTypesController);
//# sourceMappingURL=vehicle-types.controller.js.map