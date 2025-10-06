import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) { }

  async create(createModuleDto: CreateModuleDto) {
    const existingModule = await this.prisma.modules.findUnique({
      where: { code: createModuleDto.code },
    });
    if (existingModule) {
      throw new BadRequestException('Mã module đã tồn tại.');
    }
    return this.prisma.modules.create({
      data: createModuleDto,
    });
  }

  async findAll() {
    return this.prisma.modules.findMany({
      include: {
        _count: { select: { role_module_permissions: true } },
      },
    });
  }

  async findOne(id: number) {
    const module = await this.prisma.modules.findUnique({
      where: { module_id: id },
      include: {
        role_module_permissions: {
          include: { roles: true },
        },
      },
    });
    if (!module) {
      throw new BadRequestException('Module không tồn tại.');
    }
    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    const module = await this.prisma.modules.findUnique({
      where: { module_id: id },
    });
    if (!module) {
      throw new BadRequestException('Module không tồn tại.');
    }
    return this.prisma.modules.update({
      where: { module_id: id },
      data: updateModuleDto,
    });
  }

  async remove(id: number) {
    const module = await this.prisma.modules.findUnique({
      where: { module_id: id },
      include: { role_module_permissions: true },
    });
    if (!module) {
      throw new BadRequestException('Module không tồn tại.');
    }
    if (module.role_module_permissions.length > 0) {
      throw new BadRequestException('Không thể xóa module đang được sử dụng.');
    }
    return this.prisma.modules.delete({
      where: { module_id: id },
    });
  }
}