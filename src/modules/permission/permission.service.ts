import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const { module_id, ...permissionData } = createPermissionDto;

    const moduleExists = await this.prisma.modules.findUnique({
      where: { module_id: module_id },
    });

    if (!moduleExists) {
      throw new BadRequestException(
        `Module với ID "${module_id}" không tồn tại.`,
      );
    }

    if (permissionData.bit_value) {
      const existingPermission = await this.prisma.permissions.findFirst({
        where: {
          module_id: module_id,
          bit_value: permissionData.bit_value,
        },
      });

      if (existingPermission) {
        throw new BadRequestException(
          `Bit value ${permissionData.bit_value} đã tồn tại trong module này.`,
        );
      }
    }

    return this.prisma.permissions.create({
      data: {
        ...permissionData,
        modules: {
          connect: {
            module_id: module_id,
          },
        },
      },
    });
  }

  // ==================================================
  // PHẦN ĐƯỢC TỐI ƯU HÓA
  // ==================================================
  async findAll() {
    const permissions = await this.prisma.permissions.findMany({
      select: {
        permission_id: true,
        name: true,
        bit_value: true,
        description: true,
        module_id: true,
        modules: true, // Lấy luôn object module liên quan
      },
    });

    // Xóa bỏ hoàn toàn Promise.all (nguyên nhân gây lỗi N+1)
    // Chúng ta dùng .map() đồng bộ (synchronous) vì đã có tất cả dữ liệu
    const permissionsWithModuleCount = permissions.map((permission) => {
      // Vì 1 permission chỉ có 1 module,
      // nên "count" chính là 1 nếu module tồn tại (không null), và 0 nếu là null
      const moduleCount = permission.modules ? 1 : 0;

      // Bạn có thể chọn xóa object 'modules' đi cho gọn
      // const { modules, ...rest } = permission;
      // return { ...rest, _count: moduleCount };

      // Hoặc giữ nguyên (như code gốc)
      return { ...permission, _count: moduleCount };
    });

    return permissionsWithModuleCount;
  }
  // ==================================================
  // KẾT THÚC PHẦN TỐI ƯU HÓA
  // ==================================================

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

    // Code gốc của bạn (dòng dưới) để check 'modules' là đúng
    // Nó xử lý trường hợp 'modules' là object (1-N) hoặc null
    const modules = Array.isArray(permission.modules)
      ? permission.modules
      : permission.modules
        ? [permission.modules]
        : [];

    if (modules.length > 0) {
      throw new BadRequestException(
        'Không thể xóa permission đang được sử dụng.',
      );
    }
    return this.prisma.permissions.delete({
      where: { permission_id: id },
    });
  }
}
