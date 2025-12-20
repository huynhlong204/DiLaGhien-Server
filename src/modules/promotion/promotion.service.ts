import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { Prisma, promotions } from '@prisma/client';
import { FindPromotionsQueryDto } from './dto/find-promotions-query.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { FindApplicablePromotionsQueryDto } from './dto/find-applicable-promotions-query.dto';

@Injectable()
export class PromotionService {
  constructor(private prisma: PrismaService) {}

  // --- CRUD Operations ---

  async create(
    dto: CreatePromotionDto,
    user: AuthenticatedUser,
  ): Promise<promotions> {
    // Kiểm tra code đã tồn tại chưa
    const existing = await this.prisma.promotions.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Mã khuyến mãi "${dto.code}" đã tồn tại.`);
    }

    let companyId: number | null = null;

    // Admin có thể tạo KM global (company_id = null) hoặc cho nhà xe cụ thể (cần thêm field company_id vào DTO nếu muốn)
    // Hiện tại mặc định Admin tạo global
    // Admin có thể tạo KM global (company_id = null) hoặc cho nhà xe cụ thể (cần thêm field company_id vào DTO nếu muốn)
    // Hiện tại mặc định Admin tạo global
    if (user.role.name === 'owner' || user.role.name === 'nhanvien') {
      // Role Company (Owner or Staff)
      if (!user.company_id) {
        throw new ForbiddenException('Tài khoản nhà xe không hợp lệ.');
      }
      companyId = user.company_id; // Nhà xe chỉ tạo được KM cho chính mình
    } else if (user.role.name !== 'admin') {
      // Not Admin and Not Company
      throw new ForbiddenException('Không có quyền tạo khuyến mãi.');
    }
    // Nếu là Admin (role_id=1), companyId giữ nguyên là null (global)

    try {
      return await this.prisma.promotions.create({
        data: {
          ...dto,
          valid_from: new Date(dto.valid_from), // Chuyển đổi string date thành Date object
          valid_to: new Date(dto.valid_to),
          company_id: companyId,
        },
      });
    } catch (error) {
      // Xử lý lỗi Prisma (ví dụ: ràng buộc duy nhất nếu kiểm tra trên không đủ)
      throw new BadRequestException(
        'Không thể tạo khuyến mãi. Dữ liệu không hợp lệ.',
      );
    }
  }

  async findAll(query: FindPromotionsQueryDto, user: AuthenticatedUser) {
    const { page = 1, limit = 10, search, is_active, status } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.promotionsWhereInput = {};

    // 1. Lọc theo quyền truy cập (Quan trọng)
    // 1. Lọc theo quyền truy cập (Quan trọng)
    if (user.role.name === 'owner' || user.role.name === 'nhanvien') {
      // Role Company
      if (!user.company_id) {
        throw new ForbiddenException('Tài khoản nhà xe không hợp lệ.');
      }
      // Nhà xe chỉ thấy KM của mình
      where.company_id = user.company_id;
    } else if (user.role.name === 'admin') {
      // Role Admin
      // Admin có thể thấy tất cả (global + của các nhà xe)
      // Nếu muốn Admin lọc theo nhà xe cụ thể, cần thêm companyId vào query DTO
    } else {
      throw new ForbiddenException('Không có quyền xem danh sách khuyến mãi.');
    }

    // 2. Lọc theo tìm kiếm (code hoặc description)
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 3. Lọc theo trạng thái active (is_active)
    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    // 4. Lọc theo trạng thái thời gian (status)
    if (status) {
      if (status === 'active') {
        where.valid_from = { lte: now };
        where.valid_to = { gte: now };
        where.is_active = true; // Đang active phải thỏa mãn is_active = true
      } else if (status === 'upcoming') {
        where.valid_from = { gt: now };
      } else if (status === 'expired') {
        where.valid_to = { lt: now };
      }
    }

    const [promotions, total] = await this.prisma.$transaction([
      this.prisma.promotions.findMany({
        where,
        skip,
        take: limit,
        orderBy: { is_active: 'desc' }, // Sắp xếp theo ngày tạo mới nhất
        include: {
          // Include tên nhà xe nếu có
          company: { select: { name: true } },
        },
      }),
      this.prisma.promotions.count({ where }),
    ]);

    return {
      data: promotions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, user: AuthenticatedUser): Promise<promotions> {
    const promotion = await this.prisma.promotions.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });

    if (!promotion) {
      throw new NotFoundException(`Không tìm thấy khuyến mãi với ID ${id}.`);
    }

    // Kiểm tra quyền: Admin được xem tất cả, Company chỉ được xem của mình
    // Kiểm tra quyền: Admin được xem tất cả, Company chỉ được xem của mình
    if (
      (user.role.name === 'owner' || user.role.name === 'nhanvien') &&
      promotion.company_id !== user.company_id
    ) {
      throw new ForbiddenException('Bạn không có quyền xem khuyến mãi này.');
    }
    const isCompany =
      user.role.name === 'owner' || user.role.name === 'nhanvien';
    const isAdmin = user.role.name === 'admin';

    if (!isAdmin && !isCompany) {
      throw new ForbiddenException('Không có quyền xem khuyến mãi.');
    }

    return promotion;
  }

  async update(
    id: number,
    dto: UpdatePromotionDto,
    user: AuthenticatedUser,
  ): Promise<promotions> {
    // 1. Tìm và kiểm tra quyền sở hữu
    const existingPromotion = await this.findOne(id, user); // findOne đã bao gồm kiểm tra quyền

    // 2. Ngăn nhà xe thay đổi company_id (nếu có trong DTO)
    //    Hoặc nếu Admin muốn chuyển KM từ global sang nhà xe / ngược lại (cần logic phức tạp hơn)
    //    Hiện tại, không cho phép thay đổi company_id sau khi tạo.

    // 3. Kiểm tra trùng code nếu code được cập nhật
    if (dto.code && dto.code !== existingPromotion.code) {
      const conflict = await this.prisma.promotions.findUnique({
        where: { code: dto.code },
      });
      if (conflict) {
        throw new ConflictException(`Mã khuyến mãi "${dto.code}" đã tồn tại.`);
      }
    }

    try {
      return await this.prisma.promotions.update({
        where: { id },
        data: {
          ...dto,
          // Chuyển đổi date string nếu có trong DTO
          valid_from: dto.valid_from ? new Date(dto.valid_from) : undefined,
          valid_to: dto.valid_to ? new Date(dto.valid_to) : undefined,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Không thể cập nhật khuyến mãi. Dữ liệu không hợp lệ.',
      );
    }
  }

  async remove(
    id: number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    // 1. Tìm và kiểm tra quyền sở hữu
    await this.findOne(id, user); // findOne đã bao gồm kiểm tra quyền

    // 2. Thực hiện xóa
    try {
      await this.prisma.promotions.delete({ where: { id } });
      return { message: `Đã xóa thành công khuyến mãi ID ${id}.` };
    } catch (error) {
      // Có thể lỗi nếu đang có vé tham chiếu đến (dù đã set SetNull)
      throw new BadRequestException(
        `Không thể xóa khuyến mãi ID ${id}. Có thể đang được sử dụng.`,
      );
    }
  }

  // --- Client Validation ---

  /**
   * @description Tìm và xác thực một mã khuyến mãi cho một nhà xe cụ thể.
   * @param code Mã khuyến mãi.
   * @param bookingCompanyId ID của nhà xe cho chuyến đi đang được đặt.
   * @returns Thông tin khuyến mãi nếu hợp lệ.
   */
  async validatePromotion(
    code: string,
    bookingCompanyId: number,
  ): Promise<
    Pick<promotions, 'id' | 'description' | 'discount_type' | 'discount_value'>
  > {
    const now = new Date();

    const promotion = await this.prisma.promotions.findUnique({
      where: { code: code },
    });

    if (!promotion) {
      throw new NotFoundException(`Mã khuyến mãi "${code}" không tồn tại.`);
    }

    // --- KIỂM TRA MỚI: Nhà xe ---
    if (
      promotion.company_id !== null &&
      promotion.company_id !== bookingCompanyId
    ) {
      throw new ForbiddenException(
        `Mã khuyến mãi "${code}" không áp dụng cho nhà xe này.`,
      );
    }

    // --- Các kiểm tra cũ ---
    if (!promotion.is_active) {
      throw new BadRequestException(
        `Mã khuyến mãi "${code}" hiện không được kích hoạt.`,
      );
    }
    if (promotion.valid_from > now) {
      throw new BadRequestException(
        `Mã khuyến mãi "${code}" chưa đến ngày áp dụng.`,
      );
    }
    if (promotion.valid_to < now) {
      throw new BadRequestException(`Mã khuyến mãi "${code}" đã hết hạn.`);
    }

    // --- KIỂM TRA MỚI: Usage Limit ---
    if (promotion.usage_limit !== null) {
      const usageCount = await this.prisma.tickets.count({
        where: {
          id: promotion.id,
          status: { notIn: ['CANCELLED'] }, // Chỉ đếm vé hợp lệ đã dùng mã
        },
      });
      if (usageCount >= promotion.usage_limit) {
        throw new BadRequestException(
          `Mã khuyến mãi "${code}" đã hết lượt sử dụng.`,
        );
      }
    }

    return {
      id: promotion.id,
      description: promotion.description,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
    };
  }

  /**
   * MỚI: Lấy danh sách các mã khuyến mãi có thể áp dụng cho một nhà xe.
   * Chỉ lấy các mã đang hoạt động và còn hiệu lực.
   * Bao gồm cả mã global (company_id = null) và mã của nhà xe đó.
   */
  async findApplicable(
    query: FindApplicablePromotionsQueryDto,
  ): Promise<Omit<promotions, 'usage_limit' | 'created_at' | 'is_active'>[]> {
    const { companyId } = query;
    const now = new Date();

    // 1. (Tùy chọn) Kiểm tra nhà xe tồn tại
    // const companyExists = await this.prisma.transport_companies.findUnique({ where: { id: companyId }, select: { id: true } });
    // if (!companyExists) {
    //     throw new NotFoundException(`Nhà xe với ID ${companyId} không tồn tại.`);
    // }

    const applicablePromotions = await this.prisma.promotions.findMany({
      where: {
        is_active: true, // Phải đang kích hoạt
        valid_from: { lte: now }, // Phải còn hiệu lực (bắt đầu <= hiện tại)
        valid_to: { gte: now }, // Phải còn hiệu lực (kết thúc >= hiện tại)
        OR: [
          { company_id: null }, // Mã global
          { company_id: companyId }, // Mã của nhà xe này
        ],
        // Thêm điều kiện lọc usage_limit nếu cần (phức tạp hơn, cần subquery hoặc raw query)
        // Hiện tại chỉ lọc theo điều kiện cơ bản
      },
      select: {
        // Chỉ lấy các trường cần thiết cho frontend hiển thị
        id: true,
        code: true,
        description: true,
        image_url: true,
        discount_type: true,
        discount_value: true,
        valid_from: true,
        valid_to: true, // Có thể hiển thị ngày hết hạn
        company_id: true, // Để biết là mã global hay riêng
      },
      orderBy: [
        { company_id: 'asc' }, // Ưu tiên mã global (null) lên đầu (tùy chọn)
        { valid_to: 'asc' }, // Ưu tiên mã sắp hết hạn lên đầu
      ],
    });

    return applicablePromotions;
  }

  /**
   * MỚI: Lấy danh sách khuyến mãi công khai (ví dụ: hiển thị trên trang chủ).
   * Chỉ lấy mã đang hoạt động, còn hiệu lực.
   */
  async findPublic(
    limit: number = 5,
  ): Promise<Omit<promotions, 'usage_limit' | 'created_at' | 'is_active'>[]> {
    const now = new Date();
    const publicPromotions = await this.prisma.promotions.findMany({
      where: {
        is_active: true,
        valid_from: { lte: now },
        valid_to: { gte: now },
        // Có thể thêm điều kiện khác, ví dụ chỉ lấy mã global
        // company_id: null,
      },
      select: {
        id: true,
        code: true,
        description: true,
        image_url: true, // Lấy ảnh nếu có
        discount_type: true,
        discount_value: true,
        valid_from: true,
        valid_to: true,
        company_id: true,
        company: { select: { name: true } }, // Lấy tên nhà xe nếu là mã riêng
      },
      orderBy: {
        valid_to: 'asc', // Ưu tiên mã sắp hết hạn
      },
      take: limit, // Giới hạn số lượng
    });
    return publicPromotions;
  }
}
