import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) { }

  async getAllRoles() {
    return this.prisma.roles.findMany({
      include: {
        _count: { select: { users: true } }
      },
    });
  }

  async getRoleById(role_id: number) {
    return this.prisma.roles.findUnique({
      where: { role_id },
      include: {
        role_module_permissions: {
          include: { modules: true }
        }
      },
    });
  }

  async createRole(dto: CreateRoleDto) {
    return this.prisma.roles.create({ data: dto });
  }

  async updateRole(role_id: number, dto: UpdateRoleDto) {
    return this.prisma.roles.update({
      where: { role_id },
      data: dto,
    });
  }

  async deleteRole(role_id: number) {
    const count = await this.prisma.users.count({
      where: { role_id },
    });

    if (count > 0) {
      throw new BadRequestException('Không thể xoá role đang được sử dụng.');
    }

    return this.prisma.roles.delete({ where: { role_id } });
  }

  async updateRolePermissions(role_id: number, dto: UpdateRolePermissionsDto) {
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

  async getRolePermissions(role_id: number) {
    return this.prisma.role_module_permissions.findMany({
      where: { role_id },
      include: { modules: true },
    });
  }
}