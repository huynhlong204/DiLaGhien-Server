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
exports.RoleModulePermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RoleModulePermissionsService = class RoleModulePermissionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const roleModulePermissions = await this.prisma.role_module_permissions.findMany({
            include: {
                roles: { select: { name: true } },
                modules: { select: { name: true } },
            },
        });
        const permissions = await this.prisma.permissions.findMany({
            select: { permission_id: true, name: true, bit_value: true },
        });
        return roleModulePermissions.map(item => ({
            ...item,
            permissions_bitmask: Number(item.permissions_bitmask),
            permissions: permissions
                .filter(p => (item.permissions_bitmask & p.bit_value) === p.bit_value)
                .map(p => ({ name: p.name, bit_value: p.bit_value })),
        }));
    }
    async create(data) {
        try {
            const roleModulePermission = await this.prisma.role_module_permissions.create({
                data: {
                    role_id: data.role_id,
                    module_id: data.module_id,
                    permissions_bitmask: data.permissions_bitmask,
                },
                include: {
                    roles: { select: { name: true } },
                    modules: { select: { name: true } },
                },
            });
            return {
                ...roleModulePermission,
                permissions_bitmask: Number(roleModulePermission.permissions_bitmask),
            };
        }
        catch (error) {
            console.error('Create error:', error);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.BadRequestException('Role and Module combination already exists');
            }
            throw new common_1.BadRequestException('Failed to create RoleModulePermissions');
        }
    }
    async update(roleId, moduleId, data) {
        try {
            const roleModulePermission = await this.prisma.role_module_permissions.update({
                where: {
                    role_id_module_id: {
                        role_id: roleId,
                        module_id: moduleId,
                    },
                },
                data: {
                    permissions_bitmask: data.permissions_bitmask,
                },
                include: {
                    roles: { select: { name: true } },
                    modules: { select: { name: true } },
                },
            });
            return {
                ...roleModulePermission,
                permissions_bitmask: Number(roleModulePermission.permissions_bitmask),
            };
        }
        catch (error) {
            console.error('Update error:', error);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('RoleModulePermissions not found');
            }
            throw new common_1.BadRequestException('Failed to update RoleModulePermissions');
        }
    }
    async delete(roleId, moduleId) {
        try {
            await this.prisma.role_module_permissions.delete({
                where: {
                    role_id_module_id: {
                        role_id: roleId,
                        module_id: moduleId,
                    },
                },
            });
            return { message: 'RoleModulePermissions deleted successfully' };
        }
        catch (error) {
            console.error('Delete error:', error);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new common_1.NotFoundException('RoleModulePermissions not found');
            }
            throw new common_1.BadRequestException('Failed to delete RoleModulePermissions');
        }
    }
};
exports.RoleModulePermissionsService = RoleModulePermissionsService;
exports.RoleModulePermissionsService = RoleModulePermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleModulePermissionsService);
//# sourceMappingURL=role-module-permissions.service.js.map