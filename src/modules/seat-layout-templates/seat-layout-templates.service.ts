// src/seat-layout-templates/seat-layout-templates.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeatLayoutTemplateDto } from './dto/create-seat-layout-template.dto';
import { UpdateSeatLayoutTemplateDto } from './dto/update-seat-layout-template.dto';
import { seat_layout_templates } from '@prisma/client';
import { UserRole } from '../../auth/enums/role.enum';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@Injectable()
export class SeatLayoutTemplatesService {
  constructor(private prisma: PrismaService) { }

  private async getRoleId(roleName: UserRole): Promise<number> {
    const role = await this.prisma.roles.findUnique({
      where: { name: roleName },
      select: { role_id: true },
    });
    if (!role) {
      throw new Error(`Role '${roleName}' not found in database. Please seed roles.`);
    }
    return role.role_id;
  }

  /**
   * Tạo một sơ đồ ghế mới. Chỉ Owner (Nhà xe) mới có thể tạo.
   * Sơ đồ sẽ luôn thuộc về công ty của Owner.
   * @param createDto DTO chứa thông tin sơ đồ ghế
   * @param user Thông tin người dùng đã xác thực (AuthenticatedUser)
   * @returns Sơ đồ ghế đã được tạo
   */
  async create(createDto: CreateSeatLayoutTemplateDto, user: AuthenticatedUser): Promise<seat_layout_templates> {
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    // Chỉ Owner được phép tạo
    if (user.role_id !== ownerRoleId) {
      throw new ForbiddenException('Bạn không có quyền tạo sơ đồ ghế. Chỉ Owner mới có thể thực hiện thao tác này.');
    }

    // Đảm bảo Owner thuộc về một công ty
    if (user.company_id === null) {
      throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty để tạo sơ đồ ghế.');
    }

    const companyIdToAssign = user.company_id; // Sơ đồ luôn thuộc về công ty của Owner

    const existingTemplate = await this.prisma.seat_layout_templates.findFirst({
      where: {
        name: createDto.name,
        company_id: companyIdToAssign, // Kiểm tra duy nhất trong phạm vi công ty
      },
    });

    if (existingTemplate) {
      throw new BadRequestException(
        `Sơ đồ ghế với tên '${createDto.name}' đã tồn tại trong phạm vi công ty này.`,
      );
    }

    return this.prisma.seat_layout_templates.create({
      data: {
        ...createDto,
        company_id: companyIdToAssign,
      },
    });
  }

  /**
   * Lấy tất cả các sơ đồ ghế.
   * Admin: xem tất cả các sơ đồ ghế của tất cả các công ty.
   * Owner: chỉ xem sơ đồ ghế của công ty mình.
   * @param user Thông tin người dùng đã xác thực (AuthenticatedUser)
   * @returns Mảng các sơ đồ ghế
   */
  async findAll(user: AuthenticatedUser): Promise<seat_layout_templates[]> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    if (user.role_id === adminRoleId) {
      return this.prisma.seat_layout_templates.findMany(); // Admin xem tất cả
    } else if (user.role_id === ownerRoleId) {
      if (user.company_id === null) {
        throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
      }
      return this.prisma.seat_layout_templates.findMany({
        where: {
          company_id: user.company_id, // Owner chỉ xem của công ty mình
        },
      });
    }
    throw new ForbiddenException('Bạn không có quyền xem sơ đồ ghế.');
  }

  /**
   * Lấy một sơ đồ ghế theo ID.
   * Admin: có thể xem bất kỳ sơ đồ nào.
   * Owner: chỉ có thể xem sơ đồ của công ty mình.
   * @param id ID của sơ đồ ghế
   * @param user Thông tin người dùng đã xác thực (AuthenticatedUser)
   * @returns Sơ đồ ghế tìm được
   */
  async findOne(id: number, user: AuthenticatedUser): Promise<seat_layout_templates> {
    const template = await this.prisma.seat_layout_templates.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Sơ đồ ghế với ID ${id} không tìm thấy.`);
    }

    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    if (user.role_id === adminRoleId) {
      return template; // Admin xem bất kỳ
    } else if (user.role_id === ownerRoleId) {
      if (user.company_id === null) {
        throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
      }
      if (template.company_id === user.company_id) { // Owner chỉ xem của công ty mình
        return template;
      }
      throw new ForbiddenException('Bạn không có quyền truy cập sơ đồ ghế này.');
    }
    throw new ForbiddenException('Bạn không có quyền xem sơ đồ ghế.');
  }

  /**
   * Cập nhật thông tin sơ đồ ghế.
   * Admin: có thể cập nhật bất kỳ sơ đồ nào.
   * Owner: chỉ có thể cập nhật sơ đồ của công ty mình.
   * @param id ID của sơ đồ ghế cần cập nhật
   * @param updateDto DTO chứa thông tin cập nhật
   * @param user Thông tin người dùng đã xác thực (AuthenticatedUser)
   * @returns Sơ đồ ghế đã được cập nhật
   */
  async update(id: number, updateDto: UpdateSeatLayoutTemplateDto, user: AuthenticatedUser): Promise<seat_layout_templates> {
    const existingTemplate = await this.prisma.seat_layout_templates.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      throw new NotFoundException(`Sơ đồ ghế với ID ${id} không tìm thấy.`);
    }

    // Đảm bảo không thay đổi company_id khi update
    if (typeof (updateDto as any).company_id !== 'undefined') {
      throw new BadRequestException('Không được phép cập nhật company_id.');
    }

    if (updateDto.name && updateDto.name !== existingTemplate.name) {
      const duplicateTemplate = await this.prisma.seat_layout_templates.findFirst({
        where: {
          name: updateDto.name,
          company_id: existingTemplate.company_id, // Vẫn kiểm tra trong phạm vi công ty cũ
          NOT: { id: existingTemplate.id },
        },
      });
      if (duplicateTemplate) {
        throw new BadRequestException(`Sơ đồ ghế với tên '${updateDto.name}' đã tồn tại trong phạm vi công ty này.`);
      }
    }

    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    if (user.role_id === adminRoleId) {
      return this.prisma.seat_layout_templates.update({
        where: { id },
        data: updateDto,
      });
    } else if (user.role_id === ownerRoleId) {
      if (user.company_id === null) {
        throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
      }
      if (existingTemplate.company_id === user.company_id) { // Owner chỉ cập nhật của công ty mình
        return this.prisma.seat_layout_templates.update({
          where: { id },
          data: updateDto,
        });
      }
      throw new ForbiddenException('Bạn không có quyền cập nhật sơ đồ ghế này.');
    }
    throw new ForbiddenException('Bạn không có quyền cập nhật sơ đồ ghế.');
  }

  /**
   * Xóa một sơ đồ ghế.
   * Admin: có thể xóa bất kỳ sơ đồ nào.
   * Owner: chỉ có thể xóa sơ đồ của công ty mình.
   * Cần kiểm tra xem có xe nào đang sử dụng sơ đồ này không trước khi xóa.
   * @param id ID của sơ đồ ghế cần xóa
   * @param user Thông tin người dùng đã xác thực (AuthenticatedUser)
   */
  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const existingTemplate = await this.prisma.seat_layout_templates.findUnique({
      where: { id },
    });

    if (!existingTemplate) {
      throw new NotFoundException(`Sơ đồ ghế với ID ${id} không tìm thấy.`);
    }

    const vehiclesUsingTemplate = await this.prisma.vehicles.count({
      where: { seat_layout_template_id: id },
    });

    if (vehiclesUsingTemplate > 0) {
      throw new BadRequestException(
        `Không thể xóa sơ đồ ghế này vì có ${vehiclesUsingTemplate} xe đang sử dụng.`,
      );
    }

    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER); // Sử dụng UserRole.OWNER

    if (user.role_id === adminRoleId) {
      await this.prisma.seat_layout_templates.delete({
        where: { id },
      });
    } else if (user.role_id === ownerRoleId) {
      if (user.company_id === null) {
        throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
      }
      if (existingTemplate.company_id === user.company_id) {
        await this.prisma.seat_layout_templates.delete({
          where: { id },
        });
      } else {
        throw new ForbiddenException('Bạn không có quyền xóa sơ đồ ghế này.');
      }
    } else {
      throw new ForbiddenException('Bạn không có quyền xóa sơ đồ ghế.');
    }
  }
}