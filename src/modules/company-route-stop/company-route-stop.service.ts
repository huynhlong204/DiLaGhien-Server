import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Đường dẫn tới PrismaService của bạn
import { CreateCompanyRouteStopDto } from './dto/create-company-route-stop.dto';
import { UpdateCompanyRouteStopDto } from './dto/update-company-route-stop.dto';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for error handling

@Injectable()
export class CompanyRouteStopsService {
  constructor(private prisma: PrismaService) { }

  async create(createCompanyRouteStopDto: CreateCompanyRouteStopDto) {
    try {
      return await this.prisma.company_route_stops.create({
        data: createCompanyRouteStopDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation
        if (error.code === 'P2002') {
          // Kiểm tra xem lỗi là do unique([company_route_id, stop_order]) hay unique([company_route_id, location_id])
          if (error.meta && Array.isArray(error.meta.target)) {
            if (error.meta.target.includes('stop_order')) {
              throw new ConflictException(
                `A stop point with order ${createCompanyRouteStopDto.stop_order} already exists for this company route.`
              );
            }
            if (error.meta.target.includes('location_id')) {
              throw new ConflictException(
                `A stop point for location ${createCompanyRouteStopDto.location_id} already exists for this company route.`
              );
            }
          }
          throw new ConflictException('Company route stop already exists with this combination.');
        }
      }
      throw error; // Re-throw other errors
    }
  }

  async findAll() {
    return this.prisma.company_route_stops.findMany({
      include: {
        company_route: true, // Bao gồm thông tin tuyến công ty
        location: true,      // Bao gồm thông tin địa điểm
      },
      orderBy: {
        stop_order: 'asc', // Sắp xếp theo thứ tự dừng mặc định
      },
    });
  }

  async findByCompanyRouteId(companyRouteId: number) {
    const stops = await this.prisma.company_route_stops.findMany({
      where: { company_route_id: companyRouteId },
      include: {
        location: true,
      },
      orderBy: {
        stop_order: 'asc',
      },
    });
    if (!stops.length) {
      // Bạn có thể chọn trả về mảng rỗng hoặc NotFoundException tùy thuộc logic nghiệp vụ
      // throw new NotFoundException(`No stop points found for company route with ID ${companyRouteId}`);
    }
    return stops;
  }

  async findOne(id: number) {
    const stopPoint = await this.prisma.company_route_stops.findUnique({
      where: { id },
      include: {
        company_route: true,
        location: true,
      },
    });
    if (!stopPoint) {
      throw new NotFoundException(`Company route stop with ID ${id} not found`);
    }
    return stopPoint;
  }

  async update(id: number, updateCompanyRouteStopDto: UpdateCompanyRouteStopDto) {
    try {
      const existingStopPoint = await this.prisma.company_route_stops.findUnique({ where: { id } });
      if (!existingStopPoint) {
        throw new NotFoundException(`Company route stop with ID ${id} not found`);
      }

      return await this.prisma.company_route_stops.update({
        where: { id },
        data: updateCompanyRouteStopDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint violation (could happen if updating stop_order or location_id to a conflicting value)
        if (error.code === 'P2002') {
          throw new ConflictException('Update failed: The new stop order or location ID conflicts with an existing entry for this company route.');
        }
        // P2025: Record not found (handled by NotFoundException above, but good to have a catch-all)
        if (error.code === 'P2025') {
          throw new NotFoundException(`Company route stop with ID ${id} not found for update.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.company_route_stops.delete({
        where: { id },
      });
      return { message: `Company route stop with ID ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record not found
        if (error.code === 'P2025') {
          throw new NotFoundException(`Company route stop with ID ${id} not found for deletion`);
        }
      }
      throw error;
    }
  }
}