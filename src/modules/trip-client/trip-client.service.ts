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

  // === HÀM TÌM KIẾM CHUYẾN ĐI (Giữ logic cũ, thêm tính giá tốt) ===
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

    try {
      // --- BƯỚC 1: TRUY VẤN RỘNG (Giữ nguyên logic cũ) ---
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
            }, // Thêm is_pickup_point
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
            }, // Thêm is_dropoff_point
          ],
        },
        // Giữ nguyên include của bạn
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
          tickets: { where: { status: { not: 'CANCELLED' } } }, // Giữ nguyên
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
        // Đảm bảo điểm đón nằm trước hoặc trùng điểm bắt đầu tuyến và điểm trả nằm sau hoặc trùng điểm kết thúc tuyến
        // Đồng thời đảm bảo fromIndex < toIndex
        return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      });

      if (finalTrips.length === 0) {
        this.logger.log(
          `No valid trips found after filtering for route: ${from} -> ${to} on ${date}`,
        );
        return [];
      }

      // --- BƯỚC 2.5 (MỚI): TÍNH GIÁ TRUNG VỊ ---
      // Lấy tất cả giá của các chuyến đi CÙNG TUYẾN CHÍNH (không xét stops) trong ngày
      // Điều này đơn giản hơn và thường đủ chính xác
      const allPricesOnRoute = await this.prisma.trips.findMany({
        where: {
          departure_time: { gte: startDate, lt: endDate },
          company_route: {
            routes: {
              from_location: {
                name: finalTrips[0].company_route.routes.from_location.name,
              }, // Lấy tên route chính từ kết quả
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
        medianPrice && medianPrice > 0 ? medianPrice * 0.85 : null; // Ngưỡng 15%

      this.logger.debug(
        `Route: ${from} -> ${to} | Date: ${date} | Median Price: ${medianPrice} | Good Price Threshold: ${goodPriceThreshold}`,
      );

      // --- BƯỚC 3: LẤY DỮ LIỆU REVIEW (Giữ nguyên) ---
      const companyIds = [
        ...new Set(
          finalTrips.map((trip) => trip.company_route.transport_companies.id),
        ),
      ];
      const reviewSummaries = await Promise.all(
        companyIds.map((id) =>
          this.reviewService.getReviewSummaryByCompany(id).catch((err) => {
            this.logger.error(
              `Failed to get review summary for company ${id}: ${err.message}`,
            );
            return { companyId: id, averageRating: null, totalReviews: 0 }; // Fallback
          }),
        ),
      );
      const summaryMap = new Map(
        reviewSummaries.map((summary) => [summary.companyId, summary]),
      );

      let popularRouteIds = new Set<number>(); // Dùng Set để tra cứu nhanh
      try {
        // Gọi API Python (ví dụ lấy top 10 theo số vé trong 30 ngày)
        const popularRouteResponse = await firstValueFrom(
          this.httpService.get<{ data: PopularRoute[] }>(
            `${this.pythonApiUrl}/reports/top-routes`,
            { params: { metric: 'tickets', days: 30, limit: 10 } }, // Lấy top 10 theo số vé
          ),
        );
        if (popularRouteResponse.data && popularRouteResponse.data.data) {
          popularRouteIds = new Set(
            popularRouteResponse.data.data.map((route) => route.route_id),
          );
          this.logger.debug(
            `Fetched popular route IDs: ${[...popularRouteIds]}`,
          );
        }
      } catch (pyApiError) {
        this.logger.error(
          `Failed to fetch popular routes from Python API: ${pyApiError.message}`,
        );
        // Không làm dừng chương trình, chỉ log lỗi
      }

      // --- BƯỚC 4: ĐỊNH DẠNG DỮ LIỆU & THÊM CỜ is_good_price ---
      const formattedTrips = finalTrips.map((trip) => {
        const company = trip.company_route.transport_companies;
        const route = trip.company_route.routes;
        const vehicleType = trip.vehicle_type;
        const summary = summaryMap.get(company.id);

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
          this.logger.warn(
            `Could not calculate arrival time for trip ${trip.id}`,
          );
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

        const route_id = route.id; // Lấy ID của tuyến đường chính
        const is_popular = popularRouteIds.has(route_id);

        // Trả về cấu trúc dữ liệu chuẩn cho Frontend
        return {
          id: trip.id.toString(),
          price: trip.price_default,
          departureTime: trip.departure_time.toISOString(),
          arrivalTime: arrivalTime,
          durationMinutes: durationMinutes,
          // Giữ nguyên fromLocation, toLocation theo query ban đầu của người dùng
          fromLocation: { name: from },
          toLocation: { name: to },
          companyName: company.name,
          companyLogoUrl: company.avatar_url,
          companyId: company.id,
          busType: vehicleType ? vehicleType.name : 'Chưa rõ',
          amenities: [], // Cần logic để lấy amenities
          companyAverageRating: summary ? summary.averageRating : null,
          companyTotalReviews: summary ? summary.totalReviews : 0,
          seatsAvailable: seatsAvailable,
          is_good_price: is_good_price, // Thêm cờ mới
          is_popular: is_popular,
        };
      });

      return formattedTrips;
    } catch (error) {
      this.logger.error(
        `Error fetching trips for route ${from} -> ${to} on ${date}:`,
        error,
      );
      return []; // Trả về mảng rỗng khi có lỗi
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
