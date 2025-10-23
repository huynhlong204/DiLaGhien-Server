// @/src/trip-client/trip-client.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay, addMinutes } from 'date-fns';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ReviewService } from '../review/review.service';

export class FindTripsQueryDto {
  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}

@Injectable()
export class TripClientService {
  private readonly logger = new Logger(TripClientService.name);
  constructor(
    private prisma: PrismaService,
    private reviewService: ReviewService,
  ) { }

  /**
   * @description Hàm nội bộ để chuyển "X giờ Y phút" thành số phút
   */
  private parseDurationToMinutes(durationStr: string): number {
    if (!durationStr) return 0;
    let totalMinutes = 0;
    const hoursMatch = durationStr.match(/(\d+)\s*giờ/);
    const minutesMatch = durationStr.match(/(\d+)\s*phút/);
    if (hoursMatch && hoursMatch[1]) {
      totalMinutes += parseInt(hoursMatch[1], 10) * 60;
    }
    if (minutesMatch && minutesMatch[1]) {
      totalMinutes += parseInt(minutesMatch[1], 10);
    }
    return totalMinutes;
  }

  async findAll(query: FindTripsQueryDto) {
    const { from, to, date } = query;

    if (!from || !to || !date) {
      return [];
    }

    // --- BƯỚC 1: TRUY VẤN RỘNG ---
    const potentialTrips = await this.prisma.trips.findMany({
      where: {
        departure_time: {
          gte: startOfDay(new Date(date)),
          lt: endOfDay(new Date(date)),
        },
        AND: [
          {
            company_route: {
              OR: [
                { routes: { from_location: { name: from } } },
                { stops: { some: { location: { name: from } } } },
              ],
            },
          },
          {
            company_route: {
              OR: [
                { routes: { to_location: { name: to } } },
                { stops: { some: { location: { name: to } } } },
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
        vehicles: {
          select: { id: true }, // Giữ lại nếu cần check xe gán
        },
        // SỬA ĐỔI QUAN TRỌNG: Lấy tất cả vé không bị hủy
        tickets: {
          where: {
            status: { not: 'CANCELLED' }, // <-- ĐÃ SỬA Ở ĐÂY
          },
        },
        vehicle_type: {
          select: {
            name: true,
          },
        },
        seat_layout_templates: {
          select: {
            seat_count: true,
          },
        },
      },
      orderBy: {
        departure_time: 'asc',
      },
    });

    // --- BƯỚC 2: LỌC LẠI THEO ĐÚNG THỨ TỰ ---
    const finalTrips = potentialTrips.filter((trip) => {
      if (!trip.company_route?.routes) return false;
      const orderedLocations: { name: string }[] = [];
      orderedLocations.push(trip.company_route.routes.from_location);
      trip.company_route.stops.forEach((stop) => {
        if (stop.location) orderedLocations.push(stop.location);
      });
      orderedLocations.push(trip.company_route.routes.to_location);
      const fromIndex = orderedLocations.findIndex((loc) => loc.name === from);
      const toIndex = orderedLocations.findIndex((loc) => loc.name === to);
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    if (finalTrips.length === 0) {
      return [];
    }

    // --- BƯỚC 3: LẤY DỮ LIỆU REVIEW ---
    const companyIds = [
      ...new Set(
        finalTrips.map((trip) => trip.company_route.transport_companies.id),
      ),
    ];
    const reviewSummariesPromises = companyIds.map((id) =>
      this.reviewService.getReviewSummaryByCompany(id),
    );
    const reviewSummaries = await Promise.all(reviewSummariesPromises);
    const summaryMap = new Map(
      reviewSummaries.map((summary) => [summary.companyId, summary]),
    );

    // --- BƯỚC 4: ĐỊNH DẠNG DỮ LIỆU TRẢ VỀ CHO FRONTEND ---
    const formattedTrips = finalTrips.map((trip) => {
      const company = trip.company_route.transport_companies;
      const route = trip.company_route.routes;
      const vehicleType = trip.vehicle_type;
      const summary = summaryMap.get(company.id);

      const durationMinutes = this.parseDurationToMinutes(route.estimated_time);
      let arrivalTime = trip.departure_time.toISOString();
      if (durationMinutes > 0) {
        arrivalTime = addMinutes(
          trip.departure_time,
          durationMinutes,
        ).toISOString();
      } else {
        this.logger.warn(
          `Could not parse duration for route ${route.id}: "${route.estimated_time}"`,
        );
      }

      const totalSeats = trip.seat_layout_templates?.seat_count || 0;
      // bookedSeats bây giờ sẽ đếm đúng số vé không bị hủy
      const bookedSeats = trip.tickets.length;
      const seatsAvailable =
        totalSeats - bookedSeats > 0 ? totalSeats - bookedSeats : 0;

      // Log để kiểm tra lại
      this.logger.debug(
        `Trip ID: ${trip.id}, Total Seats: ${totalSeats}, Booked (Not Cancelled): ${bookedSeats}, Available: ${seatsAvailable}`,
      );

      return {
        id: trip.id.toString(),
        price: trip.price_default,
        departureTime: trip.departure_time.toISOString(),
        arrivalTime: arrivalTime,
        durationMinutes: durationMinutes,
        fromLocation: { name: from },
        toLocation: { name: to },
        companyName: company.name,
        companyLogoUrl: company.avatar_url,
        companyId: company.id,
        busType: vehicleType ? vehicleType.name : 'Chưa rõ',
        amenities: [],
        companyAverageRating: summary ? summary.averageRating : null,
        companyTotalReviews: summary ? summary.totalReviews : 0,
        seatsAvailable: seatsAvailable, // Trả về số ghế đã tính
      };
    });

    return formattedTrips;
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