// @/src/trip-client/trip-client.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Đảm bảo đường dẫn đúng
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay, addMinutes, isValid } from 'date-fns'; // Thêm isValid
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ReviewService } from '../review/review.service'; // Đảm bảo đường dẫn đúng
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  TripClientResponse,
  PromotionInfo,
} from './dto/trip-client-response.interface';

// DTO cho query params
export class FindTripsQueryDto {
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
  @IsOptional() @IsDateString() date?: string;
}

interface PopularRoute {
  route_id: number;
  // Các trường khác có thể có nhưng không cần thiết ở đây
}

export class ApplicablePromotion {
  id: number;
  code: string;
  description: string;
  discount_type: 'fixed_amount' | 'percentage';
  discount_value: number;
  company_id: number | null;
  // Có thể thêm valid_to, valid_from nếu cần
}

// Hàm tính median (trung vị)
function calculateMedian(numbers: number[]): number | null {
  if (!numbers || numbers.length === 0) {
    return null;
  }
  const sorted = numbers
    .filter((n) => typeof n === 'number' && !isNaN(n))
    .sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }
  const middleIndex = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
  } else {
    return sorted[middleIndex];
  }
}

@Injectable()
export class TripClientService {
  private readonly logger = new Logger(TripClientService.name);
  private readonly pythonApiUrl: string;
  constructor(
    private prisma: PrismaService,
    private reviewService: ReviewService,
    private readonly httpService: HttpService, // 👈 INJECT HttpService
    private readonly configService: ConfigService, // 👈 INJECT ConfigService
  ) {
    this.pythonApiUrl = this.configService.get<string>(
      'PYTHON_API_URL',
      'http://localhost:8001',
    ); // Giá trị mặc định nếu không có trong .env
    if (!this.pythonApiUrl) {
      this.logger.warn(
        'PYTHON_API_URL is not set in environment variables. Using default.',
      );
    }
  }

  // Hàm parse duration (giữ nguyên)
  private parseDurationToMinutes(durationStr: string | null): number {
    if (!durationStr) return 0;
    let totalMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+)\s*giờ/);
    const minutesMatch = durationStr.match(/(\d+)\s*phút/);
    if (hoursMatch?.[1]) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    if (minutesMatch?.[1]) totalMinutes += parseInt(minutesMatch[1], 10);
    return totalMinutes;
  }

  // === HÀM TÌM KIẾM CHUYẾN ĐI ĐÃ NÂNG CẤP HOÀN CHỈNH ===
  async findAll(query: FindTripsQueryDto) {
    const { from, to, date } = query;
    if (!from || !to || !date || !isValid(new Date(date))) {
      this.logger.warn(
        `Invalid query parameters received: from=${from}, to=${to}, date=${date}`,
      );
      return [];
    }

    const queryDate = new Date(date);
    const startDate = startOfDay(queryDate);
    const endDate = endOfDay(queryDate);
    const NESTJS_API_URL = this.configService.get<string>(
      'NESTJS_API_URL',
      'http://localhost:3001',
    );

    try {
      // --- BƯỚC 1: TRUY VẤN RỘNG (Giữ nguyên logic cũ của bạn) ---
      const potentialTrips = await this.prisma.trips.findMany({
        where: {
          departure_time: { gte: startDate, lt: endDate },
          AND: [
            {
              company_route: {
                OR: [
                  { routes: { from_location: { name: from } } },
                  {
                    stops: {
                      some: { location: { name: from }, is_pickup_point: true },
                    },
                  },
                ],
              },
            },
            {
              company_route: {
                OR: [
                  { routes: { to_location: { name: to } } },
                  {
                    stops: {
                      some: { location: { name: to }, is_dropoff_point: true },
                    },
                  },
                ],
              },
            },
          ],
        },
        include: {
          company_route: {
            include: {
              transport_companies: true,
              stops: {
                include: { location: true },
                orderBy: { stop_order: 'asc' },
              },
              routes: {
                select: {
                  id: true,
                  from_location: true,
                  to_location: true,
                  estimated_time: true,
                },
              },
            },
          },
          vehicles: { select: { id: true } },
          tickets: { where: { status: { not: 'CANCELLED' } } },
          vehicle_type: { select: { name: true } },
          seat_layout_templates: { select: { seat_count: true } },
        },
        orderBy: { departure_time: 'asc' },
      });

      // --- BƯỚC 2: LỌC LẠI THEO ĐÚNG THỨ TỰ (Giữ nguyên logic cũ) ---
      const finalTrips = potentialTrips.filter((trip) => {
        if (!trip.company_route?.routes) return false;
        const orderedLocations: { name: string }[] = [];
        orderedLocations.push(trip.company_route.routes.from_location);
        trip.company_route.stops.forEach((stop) => {
          if (stop.location) orderedLocations.push(stop.location);
        });
        orderedLocations.push(trip.company_route.routes.to_location);
        const fromIndex = orderedLocations.findIndex(
          (loc) => loc.name === from,
        );
        const toIndex = orderedLocations.findIndex((loc) => loc.name === to);
        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      });

      if (finalTrips.length === 0) return [];

      // Lấy ID route chính và ID nhà xe đầu tiên (đại diện cho tuyến này)
      const representativeCompanyId =
        finalTrips[0].company_route.transport_companies.id;

      // --- BƯỚC 2.5: TÍNH GIÁ TRUNG VỊ (Cho nhãn is_good_price) ---
      const allPricesOnRoute = await this.prisma.trips.findMany({
        where: {
          departure_time: { gte: startDate, lt: endDate },
          company_route: {
            routes: {
              from_location: {
                name: finalTrips[0].company_route.routes.from_location.name,
              },
              to_location: {
                name: finalTrips[0].company_route.routes.to_location.name,
              },
            },
          },
        },
        select: { price_default: true },
      });
      const prices = allPricesOnRoute
        .map((t) => t.price_default)
        .filter((p) => p != null) as number[];
      const medianPrice = calculateMedian(prices);
      const goodPriceThreshold =
        medianPrice && medianPrice > 0 ? medianPrice * 0.85 : null;

      // --- BƯỚC 3: LẤY DỮ LIỆU REVIEW & COMPANY IDs (BATCH OPTIMIZED) ---
      const companyIds = [
        ...new Set(
          finalTrips.map((trip) => trip.company_route.transport_companies.id),
        ),
      ];

      // OLD SLOW WAY: await Promise.all(companyIds.map(...))
      // NEW FAST WAY: Single Query
      const reviewStatsMap =
        await this.reviewService.getReviewStatsForCompanies(companyIds);

      const summaryMap = {
        get: (id: number) =>
          reviewStatsMap.get(id) || { averageRating: null, totalReviews: 0 },
      }; // Mocking the Map interface we used before slightly, or just use the map directly inside map loop below.
      this.logger.debug(
        `Calling internal Promotions API at ${NESTJS_API_URL}/promotion/applicable for companyId=${representativeCompanyId}`,
      );

      // ----------------------------------------------------------------------
      // --- BƯỚC 3.5: LẤY TẤT CẢ KHUYẾN MÃI ÁP DỤNG ---
      // ----------------------------------------------------------------------
      // --- BƯỚC 3.5: LẤY TẤT CẢ KHUYẾN MÃI ÁP DỤNG CHO TẤT CẢ CÔNG TY ---
      // ----------------------------------------------------------------------
      let allApplicablePromotions: ApplicablePromotion[] = [];
      const now = new Date();

      try {
        // Lấy tất cả mã khuyến mãi: (1) Mã global (company_id: null) VÀ (2) Mã của các công ty trong tuyến
        const rawPromotions = await this.prisma.promotions.findMany({
          where: {
            is_active: true, // Phải đang kích hoạt
            valid_from: { lte: now }, // Phải còn hiệu lực (bắt đầu <= hiện tại)
            valid_to: { gte: now }, // Phải còn hiệu lực (kết thúc >= hiện tại)
            OR: [
              { company_id: null }, // Mã global
              { company_id: { in: companyIds } }, // Mã của các công ty đang có chuyến
            ],
          },
          select: {
            id: true,
            code: true,
            description: true,
            discount_type: true,
            discount_value: true,
            company_id: true,
          },
        });

        // Ánh xạ kết quả Prisma thành kiểu ApplicablePromotion
        allApplicablePromotions = rawPromotions.map((promo) => ({
          id: promo.id,
          code: promo.code,
          description: promo.description,
          discount_type: promo.discount_type as 'fixed_amount' | 'percentage', // Cast kiểu string sang union type
          discount_value: promo.discount_value,
          company_id: promo.company_id,
        }));

        this.logger.debug(
          `Found ${allApplicablePromotions.length} applicable promotions from DB.`,
        );
      } catch (dbError) {
        this.logger.error(
          `Failed to fetch applicable promotions directly from DB: ${dbError.message}`,
          dbError,
        );
        allApplicablePromotions = [];
      }
      // ===========================================
      // ===========================================
      // Tạo Map để tra cứu nhanh: CompanyID -> List<Promotion>
      const promoMap = new Map<number, ApplicablePromotion[]>();

      allApplicablePromotions.forEach((promo) => {
        // Gán mã global cho tất cả nhà xe
        if (promo.company_id === null) {
          companyIds.forEach((id) => {
            const promos = promoMap.get(id) || [];
            // Tránh mã global trùng lặp trong list
            if (!promos.some((p) => p.id === promo.id)) {
              promos.push(promo);
              promoMap.set(id, promos);
            }
          });
        } else {
          // Gán mã cụ thể cho nhà xe đó
          const promos = promoMap.get(promo.company_id) || [];
          promos.push(promo);
          promoMap.set(promo.company_id, promos);
        }
      });
      // ===========================================

      // --- BƯỚC 4: ĐỊNH DẠNG DỮ LIỆU & THÊM CỜ ---
      const formattedTrips = finalTrips.map((trip) => {
        const company = trip.company_route.transport_companies;
        const route = trip.company_route.routes;
        const vehicleType = trip.vehicle_type;
        const summary = reviewStatsMap.get(company.id);

        const durationMinutes = this.parseDurationToMinutes(
          route.estimated_time,
        );
        let arrivalTime = trip.departure_time.toISOString();
        try {
          if (durationMinutes > 0 && isValid(trip.departure_time)) {
            arrivalTime = addMinutes(
              trip.departure_time,
              durationMinutes,
            ).toISOString();
          }
        } catch (e) {
          /* ... */
        }

        const totalSeats = trip.seat_layout_templates?.seat_count || 0;
        const bookedSeats = trip.tickets.length;
        const seatsAvailable =
          totalSeats > bookedSeats ? totalSeats - bookedSeats : 0;

        // Tính cờ is_good_price
        const is_good_price = !!(
          goodPriceThreshold !== null &&
          trip.price_default &&
          trip.price_default > 0 &&
          trip.price_default <= goodPriceThreshold
        );

        // === GÁN THÔNG TIN KHUYẾN MÃI (CHỌN MÃ TỐT NHẤT) ===
        const availablePromos = promoMap.get(company.id) || [];

        // Logic chọn KM: chọn KM có discount_value cao nhất (chưa tính loại % hay số tiền)
        const bestPromo = availablePromos.reduce(
          (best, current) => {
            // Logic đơn giản: ưu tiên giá trị tuyệt đối lớn hơn
            if (!best || current.discount_value > best.discount_value) {
              return current;
            }
            return best;
          },
          null as ApplicablePromotion | null,
        );
        // ======================================

        // Trả về cấu trúc dữ liệu chuẩn cho Frontend
        return {
          id: trip.id.toString(),
          price: trip.price_default,
          departureTime: trip.departure_time.toISOString(),
          arrivalTime: arrivalTime,
          durationMinutes: durationMinutes,
          fromLocation: { name: from }, // Dùng from/to từ query
          toLocation: { name: to }, // Dùng from/to từ query
          companyName: company.name,
          companyLogoUrl: company.avatar_url,
          companyId: company.id,
          busType: vehicleType ? vehicleType.name : 'Chưa rõ',
          amenities: [],
          companyAverageRating: summary ? summary.averageRating : null,
          companyTotalReviews: summary ? summary.totalReviews : 0,
          seatsAvailable: seatsAvailable,
          is_good_price: is_good_price,
          promotion_info: bestPromo || null, // Gán mã khuyến mãi được ưu tiên nhất
        };
      });

      return formattedTrips;
    } catch (error) {
      this.logger.error(
        `Critical error in trip fetching pipeline: ${error.message}`,
        error,
      );
      return [];
    }
  }

  /**
   * Lấy dữ liệu vé của một chuyến đi cụ thể để hiển thị.
   */
  async getTicketsByTrip(tripId: number) {
    const tripWithTickets = await this.prisma.trips.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        departure_time: true,
        price_default: true,
        company_route_id: true,
        company_route: {
          include: {
            transport_companies: true,
            stops: {
              include: { location: true },
              orderBy: { stop_order: 'asc' },
            },
            routes: {
              include: {
                from_location: true,
                to_location: true,
              },
            },
          },
        },
        seat_layout_templates: true, // Lấy layout
        status: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } }, // Lấy vé không bị hủy
          include: { ticket_details: true },
        },
        vehicle_type: {
          // Lấy tên loại xe
          select: { name: true },
        },
      },
    });

    if (!tripWithTickets) {
      throw new NotFoundException(`Không tìm thấy chuyến đi với ID ${tripId}.`);
    }
    // Cân nhắc định dạng dữ liệu trả về ở đây nếu cần cho trang chi tiết
    return tripWithTickets;
  }
}
