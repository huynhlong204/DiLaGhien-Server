import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleModulePermissionsService {
  constructor(private prisma: PrismaService) { }

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

  async findOne(roleId: number, moduleId: number) {
    try {
      const roleModulePermission = await this.prisma.role_module_permissions.findUniqueOrThrow({
        where: {
          role_id_module_id: {
            role_id: roleId,
            module_id: moduleId,
          },
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
    } catch (error) {
      // Bắt lỗi nếu không tìm thấy bản ghi (P2025)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`RoleModulePermissions with Role ID ${roleId} and Module ID ${moduleId} not found`);
      }
      throw new BadRequestException('Failed to find RoleModulePermissions');
    }
  }


  async create(data: { role_id: number; module_id: number; permissions_bitmask: number }) {
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
    } catch (error) {
      console.error('Create error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Role and Module combination already exists');
      }
      throw new BadRequestException('Failed to create RoleModulePermissions');
    }
  }

  async update(roleId: number, moduleId: number, data: { permissions_bitmask: number }) {
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
    } catch (error) {
      console.error('Update error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('RoleModulePermissions not found');
      }
      throw new BadRequestException('Failed to update RoleModulePermissions');
    }
  }

  async delete(roleId: number, moduleId: number) {
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
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('RoleModulePermissions not found');
      }
      throw new BadRequestException('Failed to delete RoleModulePermissions');
    }
  }
}