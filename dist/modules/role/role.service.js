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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RoleService = class RoleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllRoles() {
        return this.prisma.roles.findMany({
            include: {
                _count: { select: { users: true } }
            },
        });
    }
    async getRoleById(role_id) {
        return this.prisma.roles.findUnique({
            where: { role_id },
            include: {
                role_module_permissions: {
                    include: { modules: true }
                }
            },
        });
    }
    async createRole(dto) {
        return this.prisma.roles.create({ data: dto });
    }
    async updateRole(role_id, dto) {
        return this.prisma.roles.update({
            where: { role_id },
            data: dto,
        });
    }
    async deleteRole(role_id) {
        const count = await this.prisma.users.count({
            where: { role_id },
        });
        if (count > 0) {
            throw new common_1.BadRequestException('Không thể xoá role đang được sử dụng.');
        }
        return this.prisma.roles.delete({ where: { role_id } });
    }
    async updateRolePermissions(role_id, dto) {
        const { module_id, permissions_bitmask } = dto;
        return this.prisma.role_module_permissions.upsert({
            where: {
                role_id_module_id: {
                    role_id,
                    module_id,
                },
            },
            update: { permissions_bitmask },
            create: {
                role_id,
                module_id,
                permissions_bitmask,
            },
        });
    }
    async getRolePermissions(role_id) {
        return this.prisma.role_module_permissions.findMany({
            where: { role_id },
            include: { modules: true },
        });
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleService);
//# sourceMappingURL=role.service.js.map