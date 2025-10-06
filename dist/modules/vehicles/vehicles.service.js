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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../auth/enums/role.enum");
let VehiclesService = class VehiclesService {
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
    async create(createVehicleDto, user) {
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id !== ownerRoleId || user.company_id === null) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo xe hoặc không thuộc về một công ty.');
        }
        const { plate_number, vehicle_type_id, seat_layout_template_id } = createVehicleDto;
        const existingVehicle = await this.prisma.vehicles.findFirst({
            where: {
                plate_number,
                company_id: user.company_id,
            },
        });
        if (existingVehicle) {
            throw new common_1.BadRequestException(`Xe với biển số '${plate_number}' đã tồn tại trong công ty của bạn.`);
        }
        const vehicleType = await this.prisma.vehicle_types.findUnique({
            where: { id: vehicle_type_id },
        });
        if (!vehicleType) {
            throw new common_1.NotFoundException(`Loại xe với ID ${vehicle_type_id} không tìm thấy.`);
        }
        const seatLayoutTemplate = await this.prisma.seat_layout_templates.findUnique({
            where: { id: seat_layout_template_id },
        });
        if (!seatLayoutTemplate) {
            throw new common_1.NotFoundException(`Sơ đồ ghế với ID ${seat_layout_template_id} không tìm thấy.`);
        }
        if (seatLayoutTemplate.company_id !== user.company_id && seatLayoutTemplate.company_id !== null) {
            throw new common_1.BadRequestException(`Sơ đồ ghế với ID ${seat_layout_template_id} không thuộc về công ty của bạn hoặc không phải sơ đồ mặc định.`);
        }
        return this.prisma.vehicles.create({
            data: {
                ...createVehicleDto,
                company_id: user.company_id,
            },
        });
    }
    async findAll(user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === adminRoleId) {
            return this.prisma.vehicles.findMany({
                include: {
                    vehicle_type: true,
                    seat_layout_template: true,
                    transport_company: true,
                }
            });
        }
        else if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
            }
            return this.prisma.vehicles.findMany({
                where: { company_id: user.company_id },
                include: {
                    vehicle_type: true,
                    seat_layout_template: true,
                    transport_company: true
                }
            });
        }
        throw new common_1.ForbiddenException('Bạn không có quyền xem danh sách xe.');
    }
    async findOne(id, user) {
        const vehicle = await this.prisma.vehicles.findUnique({
            where: { id },
            include: {
                vehicle_type: true,
                seat_layout_template: true,
                transport_company: true,
            }
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Xe với ID ${id} không tìm thấy.`);
        }
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === adminRoleId) {
            return vehicle;
        }
        else if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
            }
            if (vehicle.company_id !== user.company_id) {
                throw new common_1.ForbiddenException('Bạn không có quyền truy cập xe này.');
            }
            return vehicle;
        }
        throw new common_1.ForbiddenException('Bạn không có quyền xem xe.');
    }
    async update(id, updateVehicleDto, user) {
        const existingVehicle = await this.prisma.vehicles.findUnique({
            where: { id },
            select: {
                id: true,
                plate_number: true,
                company_id: true,
                vehicle_type_id: true,
                seat_layout_template_id: true,
                status: true,
                brand: true,
            },
        });
        if (!existingVehicle) {
            throw new common_1.NotFoundException(`Xe với ID ${id} không tìm thấy.`);
        }
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === ownerRoleId) {
            if (user.company_id === null || existingVehicle.company_id !== user.company_id) {
                throw new common_1.ForbiddenException('Bạn không có quyền cập nhật xe này.');
            }
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật xe.');
        }
        if (updateVehicleDto.plate_number && updateVehicleDto.plate_number !== existingVehicle.plate_number) {
            const duplicateVehicle = await this.prisma.vehicles.findFirst({
                where: {
                    plate_number: updateVehicleDto.plate_number,
                    company_id: existingVehicle.company_id,
                    NOT: { id: existingVehicle.id },
                },
            });
            if (duplicateVehicle) {
                throw new common_1.BadRequestException(`Xe với biển số '${updateVehicleDto.plate_number}' đã tồn tại trong công ty này.`);
            }
        }
        if (updateVehicleDto.vehicle_type_id && updateVehicleDto.vehicle_type_id !== existingVehicle.vehicle_type_id) {
            const vehicleType = await this.prisma.vehicle_types.findUnique({
                where: { id: updateVehicleDto.vehicle_type_id },
            });
            if (!vehicleType) {
                throw new common_1.NotFoundException(`Loại xe với ID ${updateVehicleDto.vehicle_type_id} không tìm thấy.`);
            }
        }
        if (updateVehicleDto.seat_layout_template_id && updateVehicleDto.seat_layout_template_id !== existingVehicle.seat_layout_template_id) {
            const seatLayoutTemplate = await this.prisma.seat_layout_templates.findUnique({
                where: { id: updateVehicleDto.seat_layout_template_id },
            });
            if (!seatLayoutTemplate) {
                throw new common_1.NotFoundException(`Sơ đồ ghế với ID ${updateVehicleDto.seat_layout_template_id} không tìm thấy.`);
            }
            if (seatLayoutTemplate.company_id !== existingVehicle.company_id && seatLayoutTemplate.company_id !== null) {
                throw new common_1.BadRequestException(`Sơ đồ ghế với ID ${updateVehicleDto.seat_layout_template_id} không thuộc về công ty của xe hoặc không phải sơ đồ mặc định.`);
            }
        }
        return this.prisma.vehicles.update({
            where: { id },
            data: updateVehicleDto,
        });
    }
    async remove(id, user) {
        const existingVehicle = await this.prisma.vehicles.findUnique({
            where: { id },
            select: { company_id: true },
        });
        if (!existingVehicle) {
            throw new common_1.NotFoundException(`Xe với ID ${id} không tìm thấy.`);
        }
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === ownerRoleId) {
            if (user.company_id === null || existingVehicle.company_id !== user.company_id) {
                throw new common_1.ForbiddenException('Bạn không có quyền xóa xe này.');
            }
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa xe.');
        }
        const tripsUsingVehicle = await this.prisma.trips.count({
            where: {
                vehicle_id: id,
                status: { in: ['scheduled', 'active', 'pending'] }
            },
        });
        if (tripsUsingVehicle > 0) {
            throw new common_1.BadRequestException(`Không thể xóa xe này vì có ${tripsUsingVehicle} chuyến đi đang sử dụng hoặc được lên lịch.`);
        }
        await this.prisma.vehicles.delete({
            where: { id },
        });
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map