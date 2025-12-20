import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

@Injectable()
export class UserPermissionsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: number, currentUser: AuthenticatedUser) {
    // 1. Kiểm tra target user tồn tại
    const targetUser = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: { roles: true },
    });

    if (!targetUser) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    // 2. Kiểm tra quyền truy cập (Owner chỉ xem nhân viên công ty mình)
    if (currentUser.role.name !== 'admin') {
      if (
        currentUser.role.name !== 'owner' ||
        targetUser.company_id !== currentUser.company_id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền xem quyền hạn của nhân viên này.',
        );
      }
    }

    // 3. Lấy role permissions (Nền tảng)
    const rolePermissions = await this.prisma.role_module_permissions.findMany({
      where: { role_id: targetUser.role_id },
      include: { modules: true },
    });

    // 4. Lấy user permissions (Riêng)
    const userPermissions = await this.prisma.user_module_permissions.findMany({
      where: { user_id: userId },
      include: { modules: true },
    });

    // 5. Build response: List tất cả modules và trạng thái
    const allModules = await this.prisma.modules.findMany({
      include: { permissions: true }, // Include detailed permissions info
    });

    const result = allModules.map((module) => {
      const rolePerm = rolePermissions.find(
        (rp) => rp.module_id === module.module_id,
      );
      const userPerm = userPermissions.find(
        (up) => up.module_id === module.module_id,
      );

      // Bitmask mặc định từ Role
      const roleBitmask = rolePerm ? rolePerm.permissions_bitmask : 0;
      // Bitmask riêng của User
      const userBitmask = userPerm ? userPerm.permissions_bitmask : 0;

      // Quyền thực tế (đang dùng logic User bổ sung cho Role)
      // Nếu muốn User override hoàn toàn thì dùng userBitmask nếu có, không thì roleBitmask
      // Ở đây ta dùng logic: User permissions là phần GÁN THÊM hoặc GHI ĐÈ.
      // Tuy nhiên với UI checkbox đơn giản, ta thường muốn biết "User này đang có những module nào được kích hoạt riêng"

      return {
        module_id: module.module_id,
        module_name: module.name,
        module_code: module.code,
        role_bitmask: roleBitmask,
        user_bitmask: userBitmask,
        available_permissions: module.permissions.map((p) => ({
          id: p.permission_id,
          name: p.name,
          description: p.description,
          bit_value: p.bit_value,
        })),
        // is_granted_by_role: roleBitmask > 0,
        // is_granted_by_user: userBitmask > 0,
      };
    });

    return result;
  }

  async update(
    userId: number,
    dto: UpdateUserPermissionsDto,
    currentUser: AuthenticatedUser,
  ) {
    // 1. Kiểm tra target user
    const targetUser = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });
    if (!targetUser) {
      throw new NotFoundException('Người dùng không tồn tại.');
    }

    // 2. Bảo mật: Chỉ Owner của cùng công ty mới được sửa
    if (currentUser.role.name !== 'admin') {
      if (
        currentUser.role.name !== 'owner' ||
        targetUser.company_id !== currentUser.company_id
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền sửa quyền hạn của nhân viên này.',
        );
      }
    }

    // 3. Cập nhật (Xóa cũ insert mới hoặc upsert)
    // Dùng transaction để đảm bảo toàn vẹn
    await this.prisma.$transaction(async (tx) => {
      // Xóa các quyền cũ của user này
      await tx.user_module_permissions.deleteMany({
        where: { user_id: userId },
      });

      // Tạo quyền mới
      if (dto.permissions.length > 0) {
        await tx.user_module_permissions.createMany({
          data: dto.permissions.map((p) => ({
            user_id: userId,
            module_id: p.moduleId,
            permissions_bitmask: p.permissionsBitmask,
          })),
        });
      }
    });

    return { message: 'Cập nhật quyền thành công.' };
  }
}
