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
exports.TripsController = void 0;
const common_1 = require("@nestjs/common");
const trips_service_1 = require("./trips.service");
const index_dto_1 = require("./dto/index.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const trip_status_enum_1 = require("./enums/trip-status.enum");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_enum_1 = require("../../auth/enums/role.enum");
let TripsController = class TripsController {
    tripService;
    constructor(tripService) {
        this.tripService = tripService;
    }
    async create(createTripDto, req) {
        const user = req.user;
        return this.tripService.create(createTripDto, user);
    }
    async createRecurring(createRecurringTripDto, req) {
        const user = req.user;
        return this.tripService.createRecurring(createRecurringTripDto, user);
    }
    async findAll(req) {
        const user = req.user;
        return this.tripService.findAll(user);
    }
    async findOne(id, req) {
        const user = req.user;
        return this.tripService.findOne(id, user);
    }
    async update(id, updateTripDto, req) {
        const user = req.user;
        return this.tripService.update(id, updateTripDto, user);
    }
    async updateStatus(id, status, req) {
        const user = req.user;
        return this.tripService.updateTripStatus(id, status, user);
    }
    async remove(id, req) {
        const user = req.user;
        await this.tripService.remove(id, user);
    }
    async getBookingsForTrip(tripId) {
        return this.tripService.findBookingsByTrip(tripId);
    }
    async getTripsByCompanyRoute(company_route_id, date) {
        if (!date) {
            throw new common_1.BadRequestException('Tham số "date" là bắt buộc.');
        }
        const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
        if (!isValidDate) {
            throw new common_1.BadRequestException('Tham số "date" phải đúng định dạng YYYY-MM-DD.');
        }
        return this.tripService.findTripsByRouteAndDate(company_route_id, date);
    }
};
exports.TripsController = TripsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo một chuyến đi mới' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Chuyến đi đã được tạo thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy tài nguyên liên quan.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_dto_1.CreateTripDto, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('recurring'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo nhiều chuyến đi định kỳ' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Các chuyến đi định kỳ đã được tạo thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc thiếu thông tin định kỳ.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy tài nguyên liên quan.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [index_dto_1.CreateRecurringTripDto, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "createRecurring", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER, role_enum_1.UserRole.DRIVER, role_enum_1.UserRole.PASSENGER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả các chuyến đi' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về danh sách các chuyến đi.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER, role_enum_1.UserRole.DRIVER, role_enum_1.UserRole.PASSENGER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy một chuyến đi theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về chi tiết chuyến đi.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chuyến đi không tìm thấy.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật một chuyến đi theo ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chuyến đi đã được cập nhật thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc không thể cập nhật.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chuyến đi không tìm thấy.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, index_dto_1.UpdateTripDto, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái của chuyến đi' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: Object.values(trip_status_enum_1.TripStatus),
                    example: trip_status_enum_1.TripStatus.ACTIVE,
                },
            },
            required: ['status'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trạng thái chuyến đi đã được cập nhật.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Trạng thái không hợp lệ hoặc chuyển đổi trạng thái không cho phép.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chuyến đi không tìm thấy.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa một chuyến đi' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Chuyến đi đã được xóa thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không thể xóa chuyến đi (ví dụ: đã có vé).' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Chuyến đi không tìm thấy.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':tripId/bookings'),
    __param(0, (0, common_1.Param)('tripId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getBookingsForTrip", null);
__decorate([
    (0, common_1.Get)('/by-route-date/:company_route_id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER, role_enum_1.UserRole.PASSENGER),
    (0, swagger_1.ApiOperation)({ summary: 'Tìm chuyến đi theo tuyến và ngày khởi hành' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách các chuyến đi phù hợp.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Tham số không hợp lệ.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy chuyến đi nào.' }),
    __param(0, (0, common_1.Param)('company_route_id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], TripsController.prototype, "getTripsByCompanyRoute", null);
exports.TripsController = TripsController = __decorate([
    (0, swagger_1.ApiTags)('trips'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('trips'),
    __metadata("design:paramtypes", [trips_service_1.TripService])
], TripsController);
//# sourceMappingURL=trips.controller.js.map