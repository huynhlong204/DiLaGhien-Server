// src/vehicle-types/vehicle-types.controller.ts
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
  Req, // Vẫn cần Req để lấy user nếu muốn
} from '@nestjs/common';
import { VehicleTypesService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
// import { Request } from 'express'; // Không cần import Request từ express nếu chỉ dùng AuthenticatedUser
// import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface'; // Không cần nếu RolesGuard đã xử lý

// Không cần interface AuthenticatedRequest phức tạp nữa.
// RolesGuard sẽ tự động kiểm tra user.role.name dựa trên AuthenticatedUser interface.

@ApiTags('Vehicle Types (Admin Only)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo một loại xe mới (Admin Only)' })
  @ApiResponse({ status: 201, description: 'Loại xe đã được tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tên loại xe đã tồn tại.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async create(@Body() createVehicleTypeDto: CreateVehicleTypeDto) {
    return this.vehicleTypesService.create(createVehicleTypeDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Lấy tất cả các loại xe' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các loại xe.' })
  async findAll() {
    return this.vehicleTypesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Lấy một loại xe theo ID' })
  @ApiResponse({ status: 200, description: 'Trả về thông tin loại xe.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại xe.' })
  async findOne(@Param('id') id: string) {
    return this.vehicleTypesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Cập nhật thông tin loại xe (Admin Only)' })
  @ApiResponse({ status: 200, description: 'Loại xe đã được cập nhật thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc tên loại xe đã tồn tại.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại xe.' })
  async update(@Param('id') id: string, @Body() updateVehicleTypeDto: UpdateVehicleTypeDto) {
    return this.vehicleTypesService.update(+id, updateVehicleTypeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Xóa một loại xe (Admin Only)' })
  @ApiResponse({ status: 204, description: 'Loại xe đã được xóa thành công.' })
  @ApiResponse({ status: 400, description: 'Không thể xóa vì có xe đang sử dụng loại này.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy loại xe.' })
  async remove(@Param('id') id: string) {
    await this.vehicleTypesService.remove(+id);
  }
}