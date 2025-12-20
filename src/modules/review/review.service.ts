// src/review/review.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReviewDto } from './dto/update-review.dto';
import { tr } from 'date-fns/locale';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  /**
   * @description Tạo mới một review
   */
  async create(
    tripId: number,
    customerId: number,
    createReviewDto: CreateReviewDto,
  ) {
    const { rating, comment } = createReviewDto;

    // 1. Kiểm tra xem chuyến đi có tồn tại không
    const trip = await this.prisma.trips.findUnique({
      where: { id: tripId },
    });
    if (!trip) {
      throw new NotFoundException(`Trip with ID ${tripId} not found`);
    }

    // 2. Xác thực khách hàng có vé cho chuyến đi này
    const ticket = await this.prisma.tickets.findFirst({
      where: {
        trip_id: tripId,
        customer_id: customerId,
        // Cân nhắc thêm: status: 'COMPLETED' (nếu có)
      },
    });
    if (!ticket) {
      throw new ForbiddenException(
        'You are not authorized to review this trip.',
      );
    }

    // 3. Kiểm tra xem khách hàng đã đánh giá chuyến này chưa
    const existingReview = await this.prisma.reviews.findUnique({
      where: {
        trip_id_customer_id: {
          trip_id: tripId,
          customer_id: customerId,
        },
      },
    });
    if (existingReview) {
      throw new ConflictException('You have already reviewed this trip.');
    }

    // 4. Tạo review mới
    return this.prisma.reviews.create({
      data: {
        rating,
        comment,
        trip_id: tripId,
        customer_id: customerId,
      },
    });
  }

  /**
   * @description Cập nhật một review
   */
  async update(
    reviewId: number,
    customerId: number,
    updateReviewDto: UpdateReviewDto,
  ) {
    // 1. Tìm review
    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // 2. Xác thực chủ sở hữu
    if (review.customer_id !== customerId) {
      throw new ForbiddenException(
        'You are not authorized to update this review',
      );
    }

    // 3. Cập nhật review
    return this.prisma.reviews.update({
      where: { id: reviewId },
      data: updateReviewDto,
    });
  }

  /**
   * @description Tìm review của 1 user cho 1 chuyến đi cụ thể
   */
  async findMyReviewForTrip(tripId: number, customerId: number) {
    // Sẽ trả về review hoặc null
    return this.prisma.reviews.findUnique({
      where: {
        trip_id_customer_id: {
          trip_id: tripId,
          customer_id: customerId,
        },
      },
      include: {
        // Có thể include thêm thông tin chuyến đi nếu cần
        // trip: true
      },
    });
  }

  /**
   * @description Tìm 1 review bằng ID
   */
  async findOne(reviewId: number) {
    const review = await this.prisma.reviews.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  /**
   * @description Lấy danh sách review theo nhà xe (có phân trang)
   * @notes ĐÃ SỬA LỖI THEO ĐÚNG SCHEMA
   */
  async findAllByCompany(
    companyId: number,
    options: { page: number; limit: number },
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [reviews, total] = await this.prisma.$transaction([
      this.prisma.reviews.findMany({
        where: {
          // SỬA LẠI: Lọc qua quan hệ lồng nhau
          trip: {
            // Từ Review -> Trip
            company_route: {
              // Từ Trip -> CompanyRoute
              company_id: companyId, // Từ CompanyRoute -> Company ID
            },
          },
        },
        include: {
          // Lấy thông tin customer và profile lồng nhau
          customer: {
            select: {
              customer_id: true,
              customer_profiles: {
                select: {
                  name: true,
                  avatar_url: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      this.prisma.reviews.count({
        where: {
          // SỬA LẠI: Lọc qua quan hệ lồng nhau
          trip: {
            company_route: {
              company_id: companyId,
            },
          },
        },
      }),
    ]);

    // Map lại dữ liệu customer để làm phẳng
    const formattedReviews = reviews.map((review) => ({
      ...review,
      customer: {
        customer_id: review.customer.customer_id,
        // Gộp customer_profiles vào cấp customer cho đơn giản
        customer_profiles: review.customer.customer_profiles
          ? {
              name: review.customer.customer_profiles.name,
              avatar_url: review.customer.customer_profiles.avatar_url,
            }
          : null,
      },
    }));

    return {
      data: formattedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * @description Lấy thống kê (tổng, trung bình) review theo nhà xe
   * @notes ĐÃ SỬA LỖI THEO ĐÚNG SCHEMA
   */
  async getReviewSummaryByCompany(companyId: number) {
    // 1. Kiểm tra nhà xe
    const company = await this.prisma.transport_companies.findUnique({
      where: { id: companyId },
      select: { id: true, name: true },
    });
    if (!company) {
      throw new NotFoundException(
        `Transport company with ID ${companyId} not found`,
      );
    }

    // 2. Dùng aggregate
    const stats = await this.prisma.reviews.aggregate({
      where: {
        // SỬA LẠI: Lọc qua quan hệ lồng nhau
        trip: {
          // Từ Review -> Trip
          company_route: {
            // Từ Trip -> CompanyRoute
            company_id: companyId, // Từ CompanyRoute -> Company ID
          },
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      companyId: company.id,
      companyName: company.name,
      totalReviews: stats._count.id || 0,
      averageRating: stats._avg.rating
        ? Number(stats._avg.rating.toFixed(1))
        : null,
    };
  }

  /**
   * @description Lấy thống kê review cho danh sách nhiều nhà xe (Batch Optimization)
   * Sử dụng Raw SQL để tránh N+1 Query
   */
  async getReviewStatsForCompanies(companyIds: number[]) {
    if (!companyIds || companyIds.length === 0) return new Map();

    // Chuyển array thành chuỗi cho SQL IN clause (an toàn hơn là dùng join string trực tiếp nếu dùng Prisma.join nhưng queryRaw hỗ trợ array)
    // Tuy nhiên queryRaw unnest array trong Postgres khá tiện.

    try {
      const results = await this.prisma.$queryRaw<any[]>`
                SELECT 
                    cr.company_id as "companyId",
                    COUNT(r.id)::int as "totalReviews",
                    AVG(r.rating)::float as "averageRating"
                FROM reviews r
                JOIN trips t ON r.trip_id = t.id
                JOIN company_routes cr ON t.company_route_id = cr.id
                WHERE cr.company_id IN (${Prisma.join(companyIds)})
                GROUP BY cr.company_id
            `;

      // Convert to Map for O(1) lookup
      const statsMap = new Map<
        number,
        { totalReviews: number; averageRating: number | null }
      >();

      // Initialize defaults (0 reviews) for all requested keys
      companyIds.forEach((id) =>
        statsMap.set(id, { totalReviews: 0, averageRating: null }),
      );

      results.forEach((row: any) => {
        statsMap.set(row.companyId, {
          totalReviews: row.totalReviews,
          averageRating: row.averageRating
            ? Number(row.averageRating.toFixed(1))
            : null,
        });
      });

      return statsMap;
    } catch (error) {
      console.error('Error aggregating reviews:', error);
      return new Map(); // Fallback harmlessly
    }
  }
}
