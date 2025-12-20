// src/vehicles/vehicles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
import { Request } from 'express'; // Import Request từ express
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface'; // Import AuthenticatedUser

@ApiTags('Vehicles (Owner & Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard) // Áp dụng cả Auth và Roles Guard
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.NHANVIEN) // Chỉ Owner và Nhanvien có thể tạo xe
  @ApiOperation({
    summary: 'Tạo một xe mới cho công ty của Owner (Owner Only)',
  })
  @ApiResponse({ status: 201, description: 'Xe đã được tạo thành công.' })
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu không hợp lệ hoặc biển số xe đã tồn tại, ID không hợp lệ.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async create(
    @Body() createVehicleDto: CreateVehicleDto,
    @Req() req: Request,
  ) {
    // Đảm bảo req.user tồn tại do JwtAuthGuard
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.vehiclesService.create(
      createVehicleDto,
      req.user as AuthenticatedUser,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN) // Admin xem tất cả, Owner xem của mình, Nhanvien xem của công ty
  @ApiOperation({
    summary: 'Lấy tất cả các xe (Admin xem tất cả, Owner xem của công ty mình)',
  })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các xe.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findAll(@Req() req: Request) {
    // Đảm bảo req.user tồn tại
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.vehiclesService.findAll(req.user as AuthenticatedUser);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN) // Admin xem bất kỳ, Owner xem của mình
  @ApiOperation({
    summary:
      'Lấy một xe theo ID (Admin xem bất kỳ, Owner xem của công ty mình)',
  })
  @ApiResponse({ status: 200, description: 'Trả về thông tin xe.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    // Đảm bảo req.user tồn tại
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.vehiclesService.findOne(+id, req.user as AuthenticatedUser);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN) // Admin cập nhật bất kỳ, Owner cập nhật của mình
  @ApiOperation({
    summary:
      'Cập nhật thông tin xe (Admin cập nhật bất kỳ, Owner cập nhật của công ty mình)',
  })
  @ApiResponse({ status: 200, description: 'Xe đã được cập nhật thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc lỗi liên kết ID.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe.' })
  async update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @Req() req: Request,
  ) {
    // Đảm bảo req.user tồn tại
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.vehiclesService.update(
      +id,
      updateVehicleDto,
      req.user as AuthenticatedUser,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content cho delete thành công
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN) // Admin xóa bất kỳ, Owner xóa của mình
  @ApiOperation({
    summary: 'Xóa một xe (Admin xóa bất kỳ, Owner xóa của công ty mình)',
  })
  @ApiResponse({ status: 204, description: 'Xe đã được xóa thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa vì xe đang được sử dụng.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy xe.' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    // Đảm bảo req.user tồn tại
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    await this.vehiclesService.remove(+id, req.user as AuthenticatedUser);
  }
}
