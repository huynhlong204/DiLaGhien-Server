// src/modules/trips/trips.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { TripService } from './trips.service';
import {
  CreateTripDto,
  UpdateTripDto,
  CreateRecurringTripDto,
} from './dto/index.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Đảm bảo đường dẫn này đúng
import { RolesGuard } from '../../auth/guards/roles.guard'; // Đảm bảo đường dẫn này đúng
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'; // Đảm bảo đường dẫn này đúng
import { TripStatus } from './enums/trip-status.enum'; // Đảm bảo đường dẫn này đúng
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/auth/enums/role.enum';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { FindTripsQueryDto } from './dto/byRouteDate.dto';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({ summary: 'Tạo một chuyến đi mới' })
  @ApiResponse({
    status: 201,
    description: 'Chuyến đi đã được tạo thành công.',
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tài nguyên liên quan.',
  })
  async create(@Body() createTripDto: CreateTripDto, @Req() req): Promise<any> {
    const user: AuthenticatedUser = req.user;
    return this.tripService.create(createTripDto, user);
  }

  @Post('recurring')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({ summary: 'Tạo nhiều chuyến đi định kỳ' })
  @ApiResponse({
    status: 201,
    description: 'Các chuyến đi định kỳ đã được tạo thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc thiếu thông tin định kỳ.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy tài nguyên liên quan.',
  })
  async createRecurring(
    @Body() createRecurringTripDto: CreateRecurringTripDto,
    @Req() req,
  ): Promise<any[]> {
    const user: AuthenticatedUser = req.user;
    return this.tripService.createRecurring(createRecurringTripDto, user);
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.OWNER,
    UserRole.NHANVIEN,
    UserRole.DRIVER,
    UserRole.PASSENGER,
  ) // Passenger có thể xem các chuyến đi công khai
  @ApiOperation({ summary: 'Lấy tất cả các chuyến đi' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các chuyến đi.' })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  async findAll(@Req() req): Promise<any[]> {
    const user: AuthenticatedUser = req.user;
    return this.tripService.findAll(user);
  }

  @Get(':id')
  @Roles(
    UserRole.ADMIN,
    UserRole.OWNER,
    UserRole.NHANVIEN,
    UserRole.DRIVER,
    UserRole.PASSENGER,
  )
  @ApiOperation({ summary: 'Lấy một chuyến đi theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về chi tiết chuyến đi.' })
  @ApiResponse({ status: 404, description: 'Chuyến đi không tìm thấy.' })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<any> {
    const user: AuthenticatedUser = req.user;
    return this.tripService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật một chuyến đi theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Chuyến đi đã được cập nhật thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc không thể cập nhật.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  @ApiResponse({ status: 404, description: 'Chuyến đi không tìm thấy.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTripDto: UpdateTripDto,
    @Req() req,
  ): Promise<any> {
    const user: AuthenticatedUser = req.user;
    return this.tripService.update(id, updateTripDto, user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({ summary: 'Cập nhật trạng thái của chuyến đi' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(TripStatus),
          example: TripStatus.ACTIVE,
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Trạng thái chuyến đi đã được cập nhật.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Trạng thái không hợp lệ hoặc chuyển đổi trạng thái không cho phép.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  @ApiResponse({ status: 404, description: 'Chuyến đi không tìm thấy.' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TripStatus,
    @Req() req,
  ): Promise<any> {
    const user: AuthenticatedUser = req.user;
    return this.tripService.updateTripStatus(id, status, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Trả về 204 No Content cho DELETE thành công
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({ summary: 'Xóa một chuyến đi' })
  @ApiResponse({
    status: 204,
    description: 'Chuyến đi đã được xóa thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa chuyến đi (ví dụ: đã có vé).',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền.' })
  @ApiResponse({ status: 404, description: 'Chuyến đi không tìm thấy.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<void> {
    const user: AuthenticatedUser = req.user;
    await this.tripService.remove(id, user);
  }

  @Get(':tripId/bookings') // Route: GET /company/trips/:tripId/bookings
  async getBookingsForTrip(@Param('tripId', ParseIntPipe) tripId: number) {
    return this.tripService.findBookingsByTrip(tripId);
  }

  @Get('/by-route-date/:company_route_id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN, UserRole.PASSENGER)
  @ApiOperation({ summary: 'Tìm chuyến đi theo tuyến và ngày khởi hành' })
  @ApiResponse({ status: 200, description: 'Danh sách các chuyến đi phù hợp.' })
  @ApiResponse({ status: 400, description: 'Tham số không hợp lệ.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chuyến đi nào.' })
  async getTripsByCompanyRoute(
    @Param('company_route_id', ParseIntPipe) company_route_id: number,
    @Query('date') date: string,
  ) {
    if (!date) {
      throw new BadRequestException('Tham số "date" là bắt buộc.');
    }

    // Kiểm tra định dạng YYYY-MM-DD
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
    if (!isValidDate) {
      throw new BadRequestException(
        'Tham số "date" phải đúng định dạng YYYY-MM-DD.',
      );
    }

    return this.tripService.findTripsByRouteAndDate(company_route_id, date);
  }
}
