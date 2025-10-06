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
exports.VehicleTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let VehicleTypesService = class VehicleTypesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVehicleTypeDto) {
        const { name } = createVehicleTypeDto;
        const existingType = await this.prisma.vehicle_types.findUnique({
            where: { name },
        });
        if (existingType) {
            throw new common_1.BadRequestException(`Loại xe với tên '${name}' đã tồn tại.`);
        }
        return this.prisma.vehicle_types.create({
            data: createVehicleTypeDto,
        });
    }
    async findAll() {
        return this.prisma.vehicle_types.findMany();
    }
    async findOne(id) {
        const vehicleType = await this.prisma.vehicle_types.findUnique({
            where: { id },
        });
        if (!vehicleType) {
            throw new common_1.NotFoundException(`Loại xe với ID ${id} không tìm thấy.`);
        }
        return vehicleType;
    }
    async update(id, updateVehicleTypeDto) {
        await this.findOne(id);
        if (updateVehicleTypeDto.name) {
            const existingType = await this.prisma.vehicle_types.findUnique({
                where: { name: updateVehicleTypeDto.name },
            });
            if (existingType && existingType.id !== id) {
                throw new common_1.BadRequestException(`Loại xe với tên '${updateVehicleTypeDto.name}' đã tồn tại.`);
            }
        }
        return this.prisma.vehicle_types.update({
            where: { id },
            data: updateVehicleTypeDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        const vehiclesUsingType = await this.prisma.vehicles.count({
            where: { vehicle_type_id: id },
        });
        if (vehiclesUsingType > 0) {
            throw new common_1.BadRequestException(`Không thể xóa loại xe này vì có ${vehiclesUsingType} xe đang sử dụng.`);
        }
        await this.prisma.vehicle_types.delete({
            where: { id },
        });
    }
};
exports.VehicleTypesService = VehicleTypesService;
exports.VehicleTypesService = VehicleTypesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehicleTypesService);
//# sourceMappingURL=vehicle-types.service.js.map