import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) { }

  async create(createPermissionDto: CreatePermissionDto) {
    const existingPermission = await this.prisma.permissions.findFirst({
      where: { bit_value: createPermissionDto.bit_value }
    });
    if (existingPermission) {
      throw new BadRequestException('Bit value đã tồn tại.');
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
        description: true,
        module_id: true
        // Không có _count ở đây
      },
    });

    // Lấy count modules cho từng permission
    const permissionsWithModuleCount = await Promise.all(
      permissions.map(async (permission) => {
        const moduleCount = await this.prisma.modules.count({
          where: { permissions: { some: { permission_id: permission.permission_id } } },
        });
        return { ...permission, _count: moduleCount };
      })
    );

    return permissionsWithModuleCount;
  }

  async findOne(id: number) {
    const permission = await this.prisma.permissions.findUnique({
      where: { permission_id: id },
      include: {
        modules: true,
      },
    });
    if (!permission) {
      throw new BadRequestException('Permission không tồn tại.');
    }
    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.prisma.permissions.findUnique({
      where: { permission_id: id },
    });
    if (!permission) {
      throw new BadRequestException('Permission không tồn tại.');
    }
    return this.prisma.permissions.update({
      where: { permission_id: id },
      data: updatePermissionDto,
    });
  }

  async remove(id: number) {
    const permission = await this.prisma.permissions.findUnique({
      where: { permission_id: id },
      include: { modules: true },
    });
    if (!permission) {
      throw new BadRequestException('Permission không tồn tại.');
    }
    // Ensure modules is always an array
    const modules = Array.isArray(permission.modules) ? permission.modules : (permission.modules ? [permission.modules] : []);
    if (modules.length > 0) {
      throw new BadRequestException('Không thể xóa permission đang được sử dụng.');
    }
    return this.prisma.permissions.delete({
      where: { permission_id: id },
    });
  }
}