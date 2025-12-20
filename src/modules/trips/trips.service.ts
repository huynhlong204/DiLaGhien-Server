// src/modules/trips/trips.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTripDto,
  UpdateTripDto,
  CreateRecurringTripDto,
} from './dto/index.dto';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { UserRole } from '../../auth/enums/role.enum';
import { TripStatus } from './enums/trip-status.enum';
import { startOfDay, endOfDay } from 'date-fns';

// Import các types từ Prisma client
import {
  trips,
  company_routes,
  vehicles,
  users,
  seat_layout_templates,
} from '@prisma/client';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { isNumber } from 'class-validator';
import { FindTripsQueryDto } from './dto/byRouteDate.dto';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  private async getRoleId(roleName: UserRole): Promise<number> {
    const role = await this.prisma.roles.findUnique({
      where: { name: roleName },
      select: { role_id: true },
    });
    if (!role) {
      throw new Error(
        `Role '${roleName}' not found in database. Please seed roles.`,
      );
    }
    return role.role_id;
  }

  private checkOwnerCompanyAccess(
    user: AuthenticatedUser,
    companyId: number,
  ): void {
    if (user.company_id === null || user.company_id !== companyId) {
      throw new ForbiddenException(
        'Bạn không có quyền quản lý chuyến đi cho công ty này.',
      );
    }
  }

  /**
   * Validate các mối quan hệ cho chuyến đi và trả về company_id liên quan.
   * @param data Dữ liệu chứa company_route_id và các ID liên quan khác.
   * @param user Người dùng đã xác thực.
   * @param adminRoleId ID vai trò Admin.
   * @param ownerRoleId ID vai trò Owner.
   * @param driverRoleId ID vai trò Driver.
   * @returns companyId của liên kết company_route đã được xác thực.
   */
  private async validateTripAssociations(
    data: {
      company_route_id: number;
      vehicle_id?: number | null;
      driver_id?: number | null;
      seat_layout_template_id?: number | null;
    },
    user: AuthenticatedUser,
    adminRoleId: number,
    ownerRoleId: number,
    driverRoleId: number,
    employeeRoleId: number,
  ): Promise<{ companyId: number }> {
    const { company_route_id, vehicle_id, driver_id, seat_layout_template_id } =
      data;

    const companyRoute = await this.prisma.company_routes.findUnique({
      where: { id: company_route_id },
      include: {
        transport_companies: true,
        routes: true,
      },
    });

    if (!companyRoute) {
      throw new NotFoundException(
        `Liên kết công ty-tuyến đường với ID ${company_route_id} không tìm thấy.`,
      );
    }
    if (!companyRoute.approved) {
      throw new BadRequestException(
        'Tuyến đường này chưa được duyệt cho công ty này.',
      );
    }

    const company_id = companyRoute.company_id; // Lấy company_id từ companyRoute

    // Kiểm tra quyền của Owner/Employee: Chỉ được tạo/cập nhật chuyến đi cho công ty của mình
    if (
      (user.role_id === ownerRoleId || user.role_id === employeeRoleId) &&
      user.company_id !== company_id
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo/cập nhật chuyến đi cho công ty khác.',
      );
    }

    // Kiểm tra Vehicle
    if (vehicle_id !== null && vehicle_id !== undefined) {
      const vehicle = await this.prisma.vehicles.findUnique({
        where: { id: vehicle_id },
      });
      if (!vehicle) {
        throw new NotFoundException(
          `Phương tiện với ID ${vehicle_id} không tìm thấy.`,
        );
      }
      if (vehicle.company_id !== company_id) {
        throw new BadRequestException(
          'Phương tiện này không thuộc về công ty đã chọn.',
        );
      }
    }

    // Kiểm tra Driver
    if (driver_id !== null && driver_id !== undefined) {
      const driverUser = await this.prisma.users.findUnique({
        where: { user_id: driver_id },
      });
      if (!driverUser) {
        throw new NotFoundException(
          `Tài xế với ID ${driver_id} không tìm thấy.`,
        );
      }
      if (driverUser.role_id !== driverRoleId) {
        throw new BadRequestException(
          `Người dùng với ID ${driver_id} không phải là tài xế.`,
        );
      }
      if (driverUser.company_id !== company_id) {
        throw new BadRequestException(
          'Tài xế này không thuộc về công ty đã chọn.',
        );
      }
    }

    // Kiểm tra Seat Layout Template
    if (
      seat_layout_template_id !== null &&
      seat_layout_template_id !== undefined
    ) {
      const seatLayoutTemplate =
        await this.prisma.seat_layout_templates.findUnique({
          where: { id: seat_layout_template_id },
        });
      if (!seatLayoutTemplate) {
        throw new NotFoundException(
          `Mẫu bố trí ghế với ID ${seat_layout_template_id} không tìm thấy.`,
        );
      }
      // Seat layout template có thể không có company_id (dành cho admin tạo)
      // Nếu có company_id, nó phải khớp với company_id của chuyến đi
      if (
        seatLayoutTemplate.company_id !== null &&
        seatLayoutTemplate.company_id !== company_id
      ) {
        throw new BadRequestException(
          'Mẫu bố trí ghế này không thuộc về công ty đã chọn.',
        );
      }
    }
    return { companyId: company_id }; // Trả về companyId đã xác thực
  }

  /**
   * Tạo một chuyến đi mới. Chỉ Admin hoặc Owner có quyền.
   * @param createTripDto DTO chứa thông tin chuyến đi, bao gồm company_route_id.
   * @param user Thông tin người dùng đã xác thực.
   * @returns Chuyến đi đã được tạo.
   */
  async create(
    createTripDto: CreateTripDto,
    user: AuthenticatedUser,
  ): Promise<trips> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const driverRoleId = await this.getRoleId(UserRole.DRIVER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    if (
      user.role_id !== adminRoleId &&
      user.role_id !== ownerRoleId &&
      user.role_id !== employeeRoleId
    ) {
      throw new ForbiddenException('Bạn không có quyền tạo chuyến đi.');
    }

    await this.validateTripAssociations(
      createTripDto,
      user,
      adminRoleId,
      ownerRoleId,
      driverRoleId,
      employeeRoleId,
    );

    const {
      company_route_id,
      vehicle_id,
      vehicle_type_id,
      driver_id,
      seat_layout_templatesId,
      departure_time,
      price_default,
      status,
    } = createTripDto;

    return this.prisma.trips.create({
      data: {
        company_route_id,
        // company_id không còn trực tiếp trên model trips nữa khi đã có company_route_id
        vehicle_id,
        vehicle_type_id, // Thêm vehicle_type_id để liên kết loại phương tiện
        departure_time: new Date(departure_time),
        price_default,
        status: status,
        seat_layout_templatesId, // Đây là khóa ngoại, dùng trong data
        driver_id,
      },
      include: {
        company_route: {
          include: {
            transport_companies: true,
            routes: {
              include: {
                from_location: true,
                to_location: true,
              },
            },
          },
        },
        vehicles: true,
        vehicle_type: true, // Đã sửa: thêm vehicle_type để lấy thông tin loại phương tiện
        driver: {
          select: { user_id: true, email: true, phone: true },
        },
        seat_layout_templates: true, // <-- Đã sửa: tên mối quan hệ
      },
    });
  }

  /**
   * Tạo nhiều chuyến đi định kỳ dựa trên số lượng chuyến.
   * @param createRecurringTripDto Dữ liệu chuyến đi và thông tin định kỳ (recurrenceDays là số lượng chuyến).
   * @param user Người dùng đã xác thực.
   * @returns Mảng các đối tượng chuyến đi đã tạo.
   */
  async createRecurring(
    createRecurringTripDto: CreateRecurringTripDto,
    user: AuthenticatedUser,
  ): Promise<trips[]> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const driverRoleId = await this.getRoleId(UserRole.DRIVER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    if (
      user.role_id !== adminRoleId &&
      user.role_id !== ownerRoleId &&
      user.role_id !== employeeRoleId
    ) {
      throw new ForbiddenException('Bạn không có quyền tạo chuyến đi định kỳ.');
    }

    await this.validateTripAssociations(
      createRecurringTripDto,
      user,
      adminRoleId,
      ownerRoleId,
      driverRoleId,
      employeeRoleId,
    );

    const {
      recurrenceDays,
      departure_time,
      company_route_id,
      vehicle_id,
      vehicle_type_id,
      driver_id,
      seat_layout_templatesId,
      price_default,
      status,
    } = createRecurringTripDto;

    if (recurrenceDays <= 0) {
      throw new BadRequestException(
        'Số lượng chuyến đi định kỳ (recurrenceDays) phải là một số nguyên dương.',
      );
    }

    const createdTrips: trips[] = [];
    let currentDepartureTime = new Date(departure_time);

    for (let i = 0; i < recurrenceDays; i++) {
      const tripSpecificDepartureTime = new Date(currentDepartureTime);

      const newTripData = {
        company_route_id,
        // company_id không còn trực tiếp trên model trips nữa
        vehicle_id,
        vehicle_type_id, // Thêm vehicle_type_id để liên kết loại phương tiện
        departure_time: tripSpecificDepartureTime,
        price_default,
        status: status || TripStatus.SCHEDULED,
        seat_layout_templatesId, // Đây là khóa ngoại, dùng trong data
        driver_id,
      };

      const createdTrip = await this.prisma.trips.create({
        data: newTripData,
        include: {
          company_route: {
            include: {
              transport_companies: true,
              routes: {
                include: {
                  from_location: true,
                  to_location: true,
                },
              },
            },
          },
          vehicles: true,
          vehicle_type: true, // Đã sửa: thêm vehicle_type để lấy thông tin loại phương tiện
          driver: {
            select: { user_id: true, email: true, phone: true },
          },
          seat_layout_templates: true, // <-- Đã sửa: tên mối quan hệ
        },
      });
      createdTrips.push(createdTrip);

      currentDepartureTime.setDate(currentDepartureTime.getDate() + 1);
    }

    return createdTrips;
  }

  /**
   * Lấy tất cả các chuyến đi. Admin có thể xem tất cả, Owner chỉ xem của công ty mình.
   * @param user Thông tin người dùng đã xác thực.
   * @returns Mảng các chuyến đi.
   */
  async findAll(user: AuthenticatedUser): Promise<trips[]> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    const whereClause: any = {};

    if (user.role_id === ownerRoleId || user.role_id === employeeRoleId) {
      if (user.company_id === null) {
        throw new ForbiddenException(
          'Tài khoản của bạn không thuộc về một công ty nào.',
        );
      }
      // Để lọc theo company_id, cần join qua company_routes
      whereClause.company_route = {
        company_id: user.company_id,
      };
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem danh sách chuyến đi.',
      );
    }

    return this.prisma.trips.findMany({
      where: whereClause,
      include: {
        company_route: {
          include: {
            transport_companies: true,
            routes: {
              include: {
                from_location: true,
                to_location: true,
              },
            },
          },
        },
        vehicles: true,
        vehicle_type: true, // Đã sửa: thêm vehicle_type để lấy thông tin loại phương tiện
        driver: {
          select: { user_id: true, email: true, phone: true },
        },
        seat_layout_templates: true, // <-- Đã sửa: tên mối quan hệ
        tickets: true,
      },
      orderBy: {
        departure_time: 'desc',
      },
    });
  }

  /**
   * Lấy một chuyến đi theo ID. Admin có thể xem bất kỳ chuyến nào, Owner chỉ xem của công ty mình.
   * @param id ID của chuyến đi.
   * @param user Thông tin người dùng đã xác thực.
   * @returns Chuyến đi tìm được.
   */
  async findOne(id: number, user: AuthenticatedUser): Promise<trips> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    const trip = await this.prisma.trips.findUnique({
      where: { id },
      include: {
        company_route: {
          include: {
            transport_companies: true,
            routes: {
              include: {
                from_location: true,
                to_location: true,
              },
            },
          },
        },
        vehicles: true,
        vehicle_type: true, // Đã sửa: thêm vehicle_type để lấy thông tin loại phương tiện
        driver: {
          select: { user_id: true, email: true, phone: true },
        },
        seat_layout_templates: true, // <-- Đã sửa: tên mối quan hệ
        tickets: true,
      },
    });

    if (!trip) {
      throw new NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
    }

    // Lấy company_id từ company_route của chuyến đi để kiểm tra quyền Owner
    const tripCompanyId = trip.company_route?.company_id;
    if (tripCompanyId === undefined || tripCompanyId === null) {
      throw new NotFoundException(
        'Không thể xác định công ty của chuyến đi này.',
      );
    }

    if (user.role_id === ownerRoleId || user.role_id === employeeRoleId) {
      this.checkOwnerCompanyAccess(user, tripCompanyId);
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException(
        'Bạn không có quyền xem chi tiết chuyến đi này.',
      );
    }

    return trip;
  }

  /**
   * Cập nhật thông tin chuyến đi. Chỉ Admin hoặc Owner có quyền.
   * @param id ID của chuyến đi cần cập nhật.
   * @param updateTripDto DTO chứa thông tin cập nhật.
   * @param user Thông tin người dùng đã xác thực.
   * @returns Chuyến đi đã được cập nhật.
   */
  async update(
    id: number,
    updateTripDto: UpdateTripDto,
    user: AuthenticatedUser,
  ): Promise<trips> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const driverRoleId = await this.getRoleId(UserRole.DRIVER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    const existingTrip = await this.prisma.trips.findUnique({
      where: { id },
      select: {
        company_route_id: true,
        status: true,
        vehicle_id: true,
        driver_id: true,
        seat_layout_templatesId: true,
        vehicle_type_id: true,
        price_default: true,
        departure_time: true,
        company_route: {
          select: { company_id: true },
        },
      },
    });

    if (!existingTrip) {
      throw new NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
    }

    // Lấy company_id từ company_route của existingTrip
    const currentCompanyId = existingTrip.company_route?.company_id;
    if (currentCompanyId === undefined || currentCompanyId === null) {
      throw new NotFoundException(
        'Không thể xác định công ty của chuyến đi hiện có.',
      );
    }

    // Kiểm tra quyền: Owner/Employee chỉ có thể cập nhật chuyến đi của công ty mình
    if (user.role_id === ownerRoleId || user.role_id === employeeRoleId) {
      this.checkOwnerCompanyAccess(user, currentCompanyId);
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật chuyến đi này.',
      );
    }

    // Không cho phép cập nhật chuyến đi đã khởi hành, hoàn thành hoặc hủy
    if (
      [TripStatus.ACTIVE, TripStatus.COMPLETED, TripStatus.CANCELLED].includes(
        existingTrip.status as TripStatus,
      )
    ) {
      throw new BadRequestException(
        'Không thể cập nhật chuyến đi đã khởi hành, hoàn thành hoặc bị hủy.',
      );
    }

    const {
      company_route_id,
      vehicle_id,
      driver_id,
      seat_layout_templatesId,
      departure_time,
      price_default,
      status,
    } = updateTripDto;

    // Không cho phép thay đổi company_route_id sau khi tạo
    if (
      company_route_id !== undefined &&
      company_route_id !== existingTrip.company_route_id
    ) {
      throw new BadRequestException(
        'Không thể thay đổi liên kết tuyến đường của chuyến đi sau khi tạo. Vui lòng tạo chuyến đi mới.',
      );
    }

    // Chuẩn bị dữ liệu để validate lại các mối quan hệ (chỉ khi chúng được cập nhật)
    const dataToValidate: any = {
      company_route_id: existingTrip.company_route_id,
    };
    if (vehicle_id !== undefined) dataToValidate.vehicle_id = vehicle_id;
    if (driver_id !== undefined) dataToValidate.driver_id = driver_id;
    if (seat_layout_templatesId !== undefined)
      dataToValidate.seat_layout_template_id = seat_layout_templatesId;

    // Chỉ validate nếu có một trong các trường liên quan đến foreign key được cung cấp để cập nhật
    if (
      vehicle_id !== undefined ||
      driver_id !== undefined ||
      seat_layout_templatesId !== undefined
    ) {
      await this.validateTripAssociations(
        dataToValidate,
        user,
        adminRoleId,
        ownerRoleId,
        driverRoleId,
        employeeRoleId,
      );
    }

    const dataToUpdate: any = {};
    if (departure_time !== undefined)
      dataToUpdate.departure_time = new Date(departure_time);
    if (price_default !== undefined) dataToUpdate.price_default = price_default;
    if (status !== undefined) dataToUpdate.status = status;

    if (
      updateTripDto.vehicle_type_id !== undefined &&
      updateTripDto.vehicle_type_id !== null
    ) {
      const vehicleTypeExists = await this.prisma.vehicle_types.findUnique({
        where: { id: updateTripDto.vehicle_type_id },
      });

      if (!vehicleTypeExists) {
        throw new BadRequestException('Loại phương tiện không tồn tại');
      }

      dataToUpdate.vehicle_type = {
        connect: { id: updateTripDto.vehicle_type_id },
      };
    }

    // Handle relational fields with nested writes
    if (vehicle_id !== undefined) {
      dataToUpdate.vehicles =
        vehicle_id === null
          ? { disconnect: true }
          : { connect: { id: vehicle_id } };
    }
    if (
      existingTrip.vehicle_type_id !== undefined &&
      existingTrip.vehicle_type_id !== null
    ) {
      dataToUpdate.vehicle_type = {
        connect: { id: existingTrip.vehicle_type_id },
      };
    }
    if (driver_id !== undefined) {
      dataToUpdate.driver =
        driver_id === null
          ? { disconnect: true }
          : { connect: { user_id: driver_id } };
    }
    if (seat_layout_templatesId !== undefined) {
      dataToUpdate.seat_layout_templates =
        seat_layout_templatesId === null
          ? { disconnect: true }
          : { connect: { id: seat_layout_templatesId } };
    }

    return this.prisma.trips.update({
      where: { id },
      data: dataToUpdate,
      include: {
        company_route: {
          include: {
            transport_companies: true,
            routes: {
              include: {
                from_location: true,
                to_location: true,
              },
            },
          },
        },
        vehicles: true,
        vehicle_type: true, // Đã sửa: thêm vehicle_type để lấy thông tin loại phương tiện
        driver: {
          select: { user_id: true, email: true, phone: true },
        },
        seat_layout_templates: true,
      },
    });
  }

  /**
   * Cập nhật trạng thái của chuyến đi. Chỉ Admin hoặc Owner có quyền.
   * @param id ID của chuyến đi.
   * @param status Trạng thái mới.
   * @param user Thông tin người dùng đã xác thực.
   * @returns Chuyến đi đã được cập nhật trạng thái.
   */
  async updateTripStatus(
    id: number,
    status: TripStatus,
    user: AuthenticatedUser,
  ): Promise<trips> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    const existingTrip = await this.prisma.trips.findUnique({
      where: { id },
      select: {
        status: true,
        company_route: {
          select: { company_id: true },
        },
      },
    });

    if (!existingTrip) {
      throw new NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
    }

    // Lấy company_id từ company_route của existingTrip
    const tripCompanyId = existingTrip.company_route?.company_id;
    if (tripCompanyId === undefined || tripCompanyId === null) {
      throw new NotFoundException(
        'Không thể xác định công ty của chuyến đi này.',
      );
    }

    if (user.role_id === ownerRoleId || user.role_id === employeeRoleId) {
      this.checkOwnerCompanyAccess(user, tripCompanyId);
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật trạng thái chuyến đi này.',
      );
    }

    if (
      existingTrip.status === TripStatus.COMPLETED ||
      existingTrip.status === TripStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Không thể thay đổi trạng thái của chuyến đi đã hoàn thành hoặc bị hủy.',
      );
    }
    if (
      status === TripStatus.ACTIVE &&
      existingTrip.status !== TripStatus.SCHEDULED &&
      existingTrip.status !== TripStatus.PENDING
    ) {
      throw new BadRequestException(
        'Chuyến đi chỉ có thể chuyển sang trạng thái "active" từ "scheduled" hoặc "pending".',
      );
    }
    if (
      status === TripStatus.COMPLETED &&
      existingTrip.status !== TripStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Chuyến đi chỉ có thể chuyển sang trạng thái "completed" từ "active".',
      );
    }
    if (
      status === TripStatus.CANCELLED &&
      existingTrip.status === TripStatus.COMPLETED
    ) {
      throw new BadRequestException('Không thể hủy chuyến đi đã hoàn thành.');
    }

    return this.prisma.trips.update({
      where: { id },
      data: { status },
      include: {
        company_route: {
          include: {
            transport_companies: true,
            routes: {
              include: {
                from_location: true,
                to_location: true,
              },
            },
          },
        },
        vehicles: true,
        vehicle_type: true, // Đã sửa: thêm vehicle_type để lấy thông tin loại phương tiện
        driver: {
          select: { user_id: true, email: true, phone: true },
        },
        seat_layout_templates: true, // <-- Đã sửa: tên mối quan hệ
      },
    });
  }

  /**
   * Xóa một chuyến đi. Chỉ Admin hoặc Owner có quyền.
   * @param id ID của chuyến đi cần xóa.
   * @param user Thông tin người dùng đã xác thực.
   */
  async remove(id: number, user: AuthenticatedUser): Promise<void> {
    const adminRoleId = await this.getRoleId(UserRole.ADMIN);
    const ownerRoleId = await this.getRoleId(UserRole.OWNER);
    const employeeRoleId = await this.getRoleId(UserRole.NHANVIEN);

    const existingTrip = await this.prisma.trips.findUnique({
      where: { id },
      select: {
        status: true,
        company_route: {
          select: { company_id: true },
        },
      },
    });

    if (!existingTrip) {
      throw new NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
    }

    // Lấy company_id từ company_route của existingTrip
    const tripCompanyId = existingTrip.company_route?.company_id;
    if (tripCompanyId === undefined || tripCompanyId === null) {
      throw new NotFoundException(
        'Không thể xác định công ty của chuyến đi này.',
      );
    }

    if (user.role_id === ownerRoleId || user.role_id === employeeRoleId) {
      this.checkOwnerCompanyAccess(user, tripCompanyId);
    } else if (user.role_id !== adminRoleId) {
      throw new ForbiddenException('Bạn không có quyền xóa chuyến đi này.');
    }

    // Chỉ có thể xóa chuyến đi ở trạng thái SCHEDULED hoặc PENDING
    if (
      existingTrip.status !== TripStatus.SCHEDULED &&
      existingTrip.status !== TripStatus.PENDING
    ) {
      throw new BadRequestException(
        'Không thể xóa chuyến đi đã bắt đầu, hoàn thành hoặc hủy bỏ.',
      );
    }

    const ticketsCount = await this.prisma.tickets.count({
      where: { trip_id: id, status: { not: 'cancelled' } },
    });

    if (ticketsCount > 0) {
      throw new BadRequestException(
        `Không thể xóa chuyến đi này vì đã có ${ticketsCount} vé được đặt.`,
      );
    }

    await this.prisma.trips.delete({
      where: { id },
    });
  }

  // Lấy danh sách vé đã đặt của một chuyến đi
  async findBookingsByTrip(tripId: number) {
    return this.prisma.tickets.findMany({
      where: {
        trip_id: tripId,
      },
      select: {
        id: true,
        seat_code: true,
        status: true,
        customers: {
          select: {
            phone: true,
            customer_profiles: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        seat_code: 'asc',
      },
    });
  }

  /**
   * Lấy các chuyến đi theo tuyến và ngày đã chọn.
   * Đã sửa lỗi xử lý ngày tháng để khớp với múi giờ địa phương.
   */
  async findTripsByRouteAndDate(company_route_id: number, date: string) {
    // SỬA LỖI: Diễn giải chuỗi 'date' thành một ngày theo múi giờ của server,
    // sau đó dùng startOfDay và endOfDay để lấy toàn bộ khoảng thời gian 24h của ngày đó.
    // Thao tác này sẽ xử lý đúng các vấn đề về múi giờ.
    const selectedDay = new Date(date);
    const startDate = startOfDay(selectedDay);
    const endDate = endOfDay(selectedDay);

    const trips = await this.prisma.trips.findMany({
      where: {
        company_route_id,
        departure_time: {
          gte: startDate,
          lte: endDate, // Tìm trong khoảng từ đầu ngày đến cuối ngày
        },
        status: {
          notIn: [TripStatus.CANCELLED, TripStatus.COMPLETED],
        },
      },
      include: {
        driver: true,
        company_route: true,
        // SỬA LỖI: `transport_companies` là một quan hệ lồng trong `company_route`, không nằm ở cấp cao nhất
        // vehicles: true,
        // seat_layout_templates: true,
        // Đoạn include dưới đây là đúng với schema của bạn
        vehicles: {
          include: {
            vehicle_type: true,
            seat_layout_template: true,
          },
        },
        seat_layout_templates: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } }, // Lấy cả vé chưa thanh toán
        },
      },
      orderBy: {
        departure_time: 'asc',
      },
    });

    // Bỏ lỗi NotFoundException để frontend có thể nhận mảng rỗng và hiển thị "Không có chuyến"
    // if (!trips || trips.length === 0) {
    //   throw new NotFoundException(`Không tìm thấy chuyến nào cho tuyến ${company_route_id} vào ngày ${date}`);
    // }

    return trips;
  }
}
