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
exports.SeatLayoutTemplatesController = void 0;
const common_1 = require("@nestjs/common");
const seat_layout_templates_service_1 = require("./seat-layout-templates.service");
const create_seat_layout_template_dto_1 = require("./dto/create-seat-layout-template.dto");
const update_seat_layout_template_dto_1 = require("./dto/update-seat-layout-template.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_enum_1 = require("../../auth/enums/role.enum");
let SeatLayoutTemplatesController = class SeatLayoutTemplatesController {
    seatLayoutTemplatesService;
    constructor(seatLayoutTemplatesService) {
        this.seatLayoutTemplatesService = seatLayoutTemplatesService;
    }
    async create(createSeatLayoutTemplateDto, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.seatLayoutTemplatesService.create(createSeatLayoutTemplateDto, req.user);
    }
    async findAll(req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.seatLayoutTemplatesService.findAll(req.user);
    }
    async findOne(id, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.seatLayoutTemplatesService.findOne(+id, req.user);
    }
    async update(id, updateSeatLayoutTemplateDto, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        return this.seatLayoutTemplatesService.update(+id, updateSeatLayoutTemplateDto, req.user);
    }
    async remove(id, req) {
        if (!req.user) {
            throw new Error('User not found in request. Ensure JwtAuthGuard is applied.');
        }
        await this.seatLayoutTemplatesService.remove(+id, req.user);
    }
};
exports.SeatLayoutTemplatesController = SeatLayoutTemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo một sơ đồ ghế mới (Chỉ Owner tạo cho công ty của mình)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sơ đồ ghế đã được tạo thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tên sơ đồ đã tồn tại.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_seat_layout_template_dto_1.CreateSeatLayoutTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], SeatLayoutTemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả các sơ đồ ghế (Admin xem tất cả, Owner xem của mình)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về danh sách các sơ đồ ghế.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SeatLayoutTemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy một sơ đồ ghế theo ID (Admin xem bất kỳ, Owner xem của mình)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trả về thông tin sơ đồ ghế.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy sơ đồ ghế.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SeatLayoutTemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin sơ đồ ghế (Admin cập nhật bất kỳ, Owner chỉ cập nhật của mình)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sơ đồ ghế đã được cập nhật thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tên sơ đồ đã tồn tại.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy sơ đồ ghế.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_seat_layout_template_dto_1.UpdateSeatLayoutTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], SeatLayoutTemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, roles_decorator_1.Roles)(role_enum_1.UserRole.ADMIN, role_enum_1.UserRole.OWNER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa một sơ đồ ghế (Admin xóa bất kỳ, Owner chỉ xóa của mình)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Sơ đồ ghế đã được xóa thành công.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Không thể xóa vì có xe đang sử dụng hoặc lý do khác.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Không tìm thấy sơ đồ ghế.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SeatLayoutTemplatesController.prototype, "remove", null);
exports.SeatLayoutTemplatesController = SeatLayoutTemplatesController = __decorate([
    (0, swagger_1.ApiTags)('Seat Layout Templates (Admin & Owner)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('seat-layout-templates'),
    __metadata("design:paramtypes", [seat_layout_templates_service_1.SeatLayoutTemplatesService])
], SeatLayoutTemplatesController);
//# sourceMappingURL=seat-layout-templates.controller.js.map