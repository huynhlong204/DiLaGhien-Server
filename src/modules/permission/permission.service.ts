import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) { }

  // src/permissions/permissions.service.ts

  async create(createPermissionDto: CreatePermissionDto) {
    // Tách moduleId ra khỏi các dữ liệu còn lại của permission
    const { module_id, ...permissionData } = createPermissionDto;

    // Bạn có thể thêm bước kiểm tra xem moduleId có tồn tại trong DB không nếu cần
    const moduleExists = await this.prisma.modules.findUnique({
      where: { module_id: module_id },
    });

    if (!moduleExists) {
      throw new BadRequestException(`Module với ID "${module_id}" không tồn tại.`);
    }

    // Kiểm tra xem bit_value đã được sử dụng trong module này chưa (tùy chọn)
    if (permissionData.bit_value) {
      const existingPermission = await this.prisma.permissions.findFirst({
        where: {
          module_id: module_id,
          bit_value: permissionData.bit_value,
        },
      });

      if (existingPermission) {
        throw new BadRequestException(
          `Bit value ${permissionData.bit_value} đã tồn tại trong module này.`
        );
      }
    }

    // Tạo permission và kết nối với module thông qua ID
    return this.prisma.permissions.create({
      data: {
        ...permissionData, // Dữ liệu của permission (name, bit_value, description)
        modules: {         // Quan hệ tên là 'module' (số ít)
          connect: {
            module_id: module_id, // Kết nối với module có id này
          },
        },
      },
    });
  }

  async findAll() {
    const permissions = await this.prisma.permissions.findMany({
      select: {
        permission_id: true,
        name: true,
        bit_value: true,
        description: true,
        module_id: true,
        modules: true
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