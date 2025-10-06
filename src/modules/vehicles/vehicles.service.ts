// src/vehicles/vehicles.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { vehicles } from '@prisma/client'; // Import Prisma generated type
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'; // Import interface
import { UserRole } from '../../auth/enums/role.enum'; // Import Role enum

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) { }

  // Helper function để lấy role_id từ tên vai trò (đã có)
  private async getRoleId(roleName: UserRole): Promise<number> {
    const role = await this.prisma.roles.findUnique({
      where: { name: roleName },
      select: { role_id: true },
    });
    if (!role) {
      // Đây là lỗi nghiêm trọng, nên throw một Error thay vì BadRequestException
      // vì nó liên quan đến cấu hình database/seed của ứng dụng.
      throw new Error(`Role '${roleName}' not found in database. Please seed roles.`);
    }
    return role.role_id;
  }

  /**
   * Tạo một xe mới cho công ty của Owner.
   * @param createVehicleDto DTO chứa thông tin xe
   * @param user Thông tin người dùng đã xác thực (Owner)
   * @returns Xe đã được tạo
   */
  async create(createVehicleDto: CreateVehicleDto, user: AuthenticatedUser): Promise<vehicles> {
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    // Đảm bảo chỉ Owner mới có quyền tạo xe và phải thuộc về một công ty
    if (user.role_id !== ownerRoleId || user.company_id === null) {
      throw new ForbiddenException('Bạn không có quyền tạo xe hoặc không thuộc về một công ty.');
    }

    const { plate_number, vehicle_type_id, seat_layout_template_id } = createVehicleDto;

    // Kiểm tra biển số xe đã tồn tại trong công ty của user
    const existingVehicle = await this.prisma.vehicles.findFirst({
      where: {
        plate_number,
        company_id: user.company_id,
      },
    });
    if (existingVehicle) {
      throw new BadRequestException(`Xe với biển số '${plate_number}' đã tồn tại trong công ty của bạn.`);
    }

    // Kiểm tra vehicle_type_id có tồn tại không
    const vehicleType = await this.prisma.vehicle_types.findUnique({
      where: { id: vehicle_type_id },
    });
    if (!vehicleType) {
      throw new NotFoundException(`Loại xe với ID ${vehicle_type_id} không tìm thấy.`);
    }

    // Kiểm tra seat_layout_template_id có tồn tại và thuộc về công ty của user hoặc là template mặc định (company_id: null)
    const seatLayoutTemplate = await this.prisma.seat_layout_templates.findUnique({
      where: { id: seat_layout_template_id },
    });
    if (!seatLayoutTemplate) {
      throw new NotFoundException(`Sơ đồ ghế với ID ${seat_layout_template_id} không tìm thấy.`);
    }
    // Logic này là chính xác: sơ đồ ghế phải thuộc công ty của user HOẶC là sơ đồ mặc định (company_id là null)
    if (seatLayoutTemplate.company_id !== user.company_id && seatLayoutTemplate.company_id !== null) {
      throw new BadRequestException(`Sơ đồ ghế với ID ${seat_layout_template_id} không thuộc về công ty của bạn hoặc không phải sơ đồ mặc định.`);
    }

    return this.prisma.vehicles.create({
      data: {
        ...createVehicleDto,
        company_id: user.company_id, // Tự động gán company_id từ user đã xác thực
      },
    });
  }

  /**
   * Lấy tất cả các xe của công ty của Owner. Admin có thể xem tất cả xe.
   * @param user Thông tin người dùng đã xác thực
   * @returns Mảng các xe
   */
  async findAll(user: AuthenticatedUser): Promise<vehicles[]> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    // ADMIN có thể xem tất cả xe, bao gồm cả các mối quan hệ
    if (user.role_id === adminRoleId) {
      return this.prisma.vehicles.findMany({
        include: {
          vehicle_type: true,
          seat_layout_template: true,
          transport_company: true, // Bao gồm thông tin công ty cho admin
        }
      });
    }
    // OWNER chỉ xem xe của công ty mình
    else if (user.role_id === ownerRoleId) {
      if (user.company_id === null) {
        throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
      }
      return this.prisma.vehicles.findMany({
        where: { company_id: user.company_id },
        include: {
          vehicle_type: true,
          seat_layout_template: true,
          transport_company: true
        }
      });
    }
    throw new ForbiddenException('Bạn không có quyền xem danh sách xe.');
  }

  /**
   * Lấy một xe theo ID. Chỉ Owner của xe hoặc Admin mới có quyền.
   * @param id ID của xe
   * @param user Thông tin người dùng đã xác thực
   * @returns Xe tìm được
   */
  async findOne(id: number, user: AuthenticatedUser): Promise<vehicles> {
    const vehicle = await this.prisma.vehicles.findUnique({
      where: { id },
      include: {
        vehicle_type: true,
        seat_layout_template: true,
        transport_company: true, // Luôn include để kiểm tra company_id
      }
    });

    if (!vehicle) {
      throw new NotFoundException(`Xe với ID ${id} không tìm thấy.`);
    }

    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    if (user.role_id === adminRoleId) {
      return vehicle;
    } else if (user.role_id === ownerRoleId) {
      if (user.company_id === null) {
        throw new BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
      }
      // Kiểm tra xem xe có thuộc về công ty của người dùng Owner không
      if (vehicle.company_id !== user.company_id) {
        throw new ForbiddenException('Bạn không có quyền truy cập xe này.');
      }
      return vehicle;
    }
    throw new ForbiddenException('Bạn không có quyền xem xe.');
  }

  /**
   * Cập nhật thông tin xe. Chỉ Owner của xe hoặc Admin mới có quyền.
   * @param id ID của xe cần cập nhật
   * @param updateVehicleDto DTO chứa thông tin cập nhật
   * @param user Thông tin người dùng đã xác thực
   * @returns Xe đã được cập nhật
   */
  async update(id: number, updateVehicleDto: UpdateVehicleDto, user: AuthenticatedUser): Promise<vehicles> {
    const existingVehicle = await this.prisma.vehicles.findUnique({
      where: { id },
      // Cần select company_id để kiểm tra quyền
      select: {
        id: true,
        plate_number: true,
        company_id: true,
        vehicle_type_id: true,
        seat_layout_template_id: true,
        status: true,
        brand: true, // Bao gồm cả brand để đảm bảo type matching với vehicle_types
      },
    });

    if (!existingVehicle) {
      throw new NotFoundException(`Xe với ID ${id} không tìm thấy.`);
    }

    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    // Kiểm tra quyền truy cập trước khi kiểm tra logic nghiệp vụ khác
    if (user.role_id === ownerRoleId) {
      if (user.company_id === null || existingVehicle.company_id !== user.company_id) {
        throw new ForbiddenException('Bạn không có quyền cập nhật xe này.');
      }
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật xe.');
    }

    // Kiểm tra biển số xe nếu có thay đổi và đã tồn tại trong cùng công ty
    if (updateVehicleDto.plate_number && updateVehicleDto.plate_number !== existingVehicle.plate_number) {
      const duplicateVehicle = await this.prisma.vehicles.findFirst({
        where: {
          plate_number: updateVehicleDto.plate_number,
          company_id: existingVehicle.company_id, // Kiểm tra trong cùng công ty
          NOT: { id: existingVehicle.id },
        },
      });
      if (duplicateVehicle) {
        throw new BadRequestException(`Xe với biển số '${updateVehicleDto.plate_number}' đã tồn tại trong công ty này.`);
      }
    }

    // Kiểm tra vehicle_type_id nếu có thay đổi
    if (updateVehicleDto.vehicle_type_id && updateVehicleDto.vehicle_type_id !== existingVehicle.vehicle_type_id) {
      const vehicleType = await this.prisma.vehicle_types.findUnique({
        where: { id: updateVehicleDto.vehicle_type_id },
      });
      if (!vehicleType) {
        throw new NotFoundException(`Loại xe với ID ${updateVehicleDto.vehicle_type_id} không tìm thấy.`);
      }
    }

    // Kiểm tra seat_layout_template_id nếu có thay đổi
    if (updateVehicleDto.seat_layout_template_id && updateVehicleDto.seat_layout_template_id !== existingVehicle.seat_layout_template_id) {
      const seatLayoutTemplate = await this.prisma.seat_layout_templates.findUnique({
        where: { id: updateVehicleDto.seat_layout_template_id },
      });
      if (!seatLayoutTemplate) {
        throw new NotFoundException(`Sơ đồ ghế với ID ${updateVehicleDto.seat_layout_template_id} không tìm thấy.`);
      }
      // Đảm bảo sơ đồ ghế thuộc về công ty của xe hoặc là mặc định
      // (Nếu là admin thì có thể gán sơ đồ mặc định hoặc sơ đồ của công ty đó)
      // Nếu là Owner thì sơ đồ phải thuộc công ty của họ hoặc là mặc định.
      // Logic đã có ở đây là đúng:
      if (seatLayoutTemplate.company_id !== existingVehicle.company_id && seatLayoutTemplate.company_id !== null) {
        throw new BadRequestException(`Sơ đồ ghế với ID ${updateVehicleDto.seat_layout_template_id} không thuộc về công ty của xe hoặc không phải sơ đồ mặc định.`);
      }
    }

    return this.prisma.vehicles.update({
      where: { id },
      data: updateVehicleDto,
    });
  }

  /**
   * Xóa một xe. Chỉ Owner của xe hoặc Admin mới có quyền.
   * Cần kiểm tra xem xe có đang được sử dụng trong các chuyến đi không.
   * @param id ID của xe cần xóa
   * @param user Thông tin người dùng đã xác thực
   */
  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const existingVehicle = await this.prisma.vehicles.findUnique({
      where: { id },
      select: { company_id: true }, // Chỉ cần company_id để kiểm tra quyền
    });

    if (!existingVehicle) {
      throw new NotFoundException(`Xe với ID ${id} không tìm thấy.`);
    }

    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);

    // Kiểm tra quyền truy cập trước khi xóa
    if (user.role_id === ownerRoleId) {
      if (user.company_id === null || existingVehicle.company_id !== user.company_id) {
        throw new ForbiddenException('Bạn không có quyền xóa xe này.');
      }
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException('Bạn không có quyền xóa xe.');
    }

    // TODO: Bổ sung kiểm tra xem xe có đang được sử dụng trong các chuyến đi (trips) hay không
    // Đây là phần quan trọng để ngăn chặn xóa xe đang có ràng buộc dữ liệu.
    // Ví dụ:
    const tripsUsingVehicle = await this.prisma.trips.count({
      where: {
        vehicle_id: id,
        // Chỉ kiểm tra các chuyến đi chưa hoàn thành hoặc đang hoạt động
        status: { in: ['scheduled', 'active', 'pending'] }
      },
    });
    if (tripsUsingVehicle > 0) {
      throw new BadRequestException(
        `Không thể xóa xe này vì có ${tripsUsingVehicle} chuyến đi đang sử dụng hoặc được lên lịch.`,
      );
    }

    await this.prisma.vehicles.delete({
      where: { id },
    });
  }
}