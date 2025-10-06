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
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PermissionService = class PermissionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPermissionDto) {
        const existingPermission = await this.prisma.permissions.findFirst({
            where: { bit_value: createPermissionDto.bit_value }
        });
        if (existingPermission) {
            throw new common_1.BadRequestException('Bit value đã tồn tại.');
        }
        return this.prisma.permissions.create({
            data: {
                ...createPermissionDto,
                modules: { connect: undefined }
            }
        });
    }
    async findAll() {
        const permissions = await this.prisma.permissions.findMany({
            select: {
                permission_id: true,
                name: true,
                bit_value: true,
                description: true
            },
        });
        const permissionsWithModuleCount = await Promise.all(permissions.map(async (permission) => {
            const moduleCount = await this.prisma.modules.count({
                where: { permissions: { some: { permission_id: permission.permission_id } } },
            });
            return { ...permission, _count: moduleCount };
        }));
        return permissionsWithModuleCount;
    }
    async findOne(id) {
        const permission = await this.prisma.permissions.findUnique({
            where: { permission_id: id },
            include: {
                modules: true,
            },
        });
        if (!permission) {
            throw new common_1.BadRequestException('Permission không tồn tại.');
        }
        return permission;
    }
    async update(id, updatePermissionDto) {
        const permission = await this.prisma.permissions.findUnique({
            where: { permission_id: id },
        });
        if (!permission) {
            throw new common_1.BadRequestException('Permission không tồn tại.');
        }
        return this.prisma.permissions.update({
            where: { permission_id: id },
            data: updatePermissionDto,
        });
    }
    async remove(id) {
        const permission = await this.prisma.permissions.findUnique({
            where: { permission_id: id },
            include: { modules: true },
        });
        if (!permission) {
            throw new common_1.BadRequestException('Permission không tồn tại.');
        }
        const modules = Array.isArray(permission.modules) ? permission.modules : (permission.modules ? [permission.modules] : []);
        if (modules.length > 0) {
            throw new common_1.BadRequestException('Không thể xóa permission đang được sử dụng.');
        }
        return this.prisma.permissions.delete({
            where: { permission_id: id },
        });
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionService);
//# sourceMappingURL=permission.service.js.map