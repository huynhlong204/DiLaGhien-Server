// @/src/trip-client/trip-client.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';
import { IsOptional, IsString, IsDateString } from 'class-validator';

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
  constructor(private prisma: PrismaService) { }

  async findAll(query: FindTripsQueryDto) {
    const { from, to, date } = query;

    // Nếu thiếu thông tin cơ bản, trả về mảng rỗng để tránh tải toàn bộ CSDL
    if (!from || !to || !date) {
      return [];
    }

    // --- BƯỚC 1: TRUY VẤN RỘNG ---
    // Tìm tất cả các chuyến trong ngày mà tuyến đường có chứa cả điểm 'from' và 'to'
    const potentialTrips = await this.prisma.trips.findMany({
      where: {
        // Lọc theo ngày khởi hành
        departure_time: {
          gte: startOfDay(new Date(date)),
          lt: endOfDay(new Date(date)),
        },
        // Lọc các tuyến đường PHẢI chứa cả hai địa điểm
        AND: [
          { // Điều kiện cho điểm đi (from)
            company_route: {
              OR: [
                { routes: { from_location: { name: from } } }, // Là điểm đầu của tuyến
                { stops: { some: { location: { name: from } } } }, // Hoặc là điểm dừng
              ],
            },
          },
          { // Điều kiện cho điểm đến (to)
            company_route: {
              OR: [
                { routes: { to_location: { name: to } } }, // Là điểm cuối của tuyến
                { stops: { some: { location: { name: to } } } }, // Hoặc là điểm dừng
              ],
            },
          },
        ],
      },
      include: {
        // Include tất cả các quan hệ cần thiết để lọc và hiển thị
        company_route: {
          include: {
            transport_companies: true,
            // Lấy tất cả điểm dừng và sắp xếp theo đúng thứ tự
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
        vehicles: { include: { vehicle_type: true, seat_layout_template: true } },
        tickets: { where: { status: 'confirmed' } },
      },
      orderBy: {
        departure_time: 'asc',
      },
    });

    // --- BƯỚC 2: LỌC LẠI THEO ĐÚNG THỨ TỰ ---
    const finalTrips = potentialTrips.filter(trip => {
      if (!trip.company_route?.routes) return false;

      // Xây dựng một mảng chứa toàn bộ các địa điểm của tuyến theo đúng thứ tự
      const orderedLocations: { name: string }[] = [];

      // 1. Thêm điểm khởi hành chính của tuyến
      orderedLocations.push(trip.company_route.routes.from_location);

      // 2. Thêm các điểm dừng trung gian
      trip.company_route.stops.forEach(stop => {
        if (stop.location) orderedLocations.push(stop.location);
      });

      // 3. Thêm điểm kết thúc chính của tuyến
      orderedLocations.push(trip.company_route.routes.to_location);

      // Tìm vị trí của điểm đi và điểm đến mà người dùng tìm kiếm
      const fromIndex = orderedLocations.findIndex(loc => loc.name === from);
      const toIndex = orderedLocations.findIndex(loc => loc.name === to);

      // Chuyến đi hợp lệ khi cả hai điểm đều tồn tại và điểm đi phải có thứ tự trước điểm đến
      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    return finalTrips;
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
        company_route: {
          include: {
            transport_companies: true,
            // Lấy tất cả điểm dừng và sắp xếp theo đúng thứ tự
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
        seat_layout_templates: true,
        status: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } },
          include: { ticket_details: true },
        },
      },
    });

    if (!tripWithTickets) {
      throw new NotFoundException(`Không tìm thấy chuyến đi với ID ${tripId}.`);
    }
    return tripWithTickets;
  }

}