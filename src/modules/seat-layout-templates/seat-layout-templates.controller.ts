// src/seat-layout-templates/seat-layout-templates.controller.ts
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
import { SeatLayoutTemplatesService } from './seat-layout-templates.service';
import { CreateSeatLayoutTemplateDto } from './dto/create-seat-layout-template.dto';
import { UpdateSeatLayoutTemplateDto } from './dto/update-seat-layout-template.dto';
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
import { Request } from 'express';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';

@ApiTags('Seat Layout Templates (Admin & Owner)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('seat-layout-templates')
export class SeatLayoutTemplatesController {
  constructor(
    private readonly seatLayoutTemplatesService: SeatLayoutTemplatesService,
  ) {}

  @Post()
  // Chỉ Owner được phép tạo sơ đồ ghế
  @Roles(UserRole.OWNER) // <-- Chỉ cho phép Owner
  @ApiOperation({
    summary: 'Tạo một sơ đồ ghế mới (Chỉ Owner tạo cho công ty của mình)',
  })
  @ApiResponse({
    status: 201,
    description: 'Sơ đồ ghế đã được tạo thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên sơ đồ đã tồn tại.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async create(
    @Body() createSeatLayoutTemplateDto: CreateSeatLayoutTemplateDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.seatLayoutTemplatesService.create(
      createSeatLayoutTemplateDto,
      req.user as AuthenticatedUser,
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({
    summary: 'Lấy tất cả các sơ đồ ghế (Admin xem tất cả, Owner xem của mình)',
  })
  @ApiResponse({ status: 200, description: 'Trả về danh sách các sơ đồ ghế.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findAll(@Req() req: Request) {
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.seatLayoutTemplatesService.findAll(
      req.user as AuthenticatedUser,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({
    summary: 'Lấy một sơ đồ ghế theo ID (Admin xem bất kỳ, Owner xem của mình)',
  })
  @ApiResponse({ status: 200, description: 'Trả về thông tin sơ đồ ghế.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sơ đồ ghế.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findOne(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.seatLayoutTemplatesService.findOne(
      +id,
      req.user as AuthenticatedUser,
    );
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({
    summary:
      'Cập nhật thông tin sơ đồ ghế (Admin cập nhật bất kỳ, Owner chỉ cập nhật của mình)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sơ đồ ghế đã được cập nhật thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên sơ đồ đã tồn tại.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sơ đồ ghế.' })
  async update(
    @Param('id') id: string,
    @Body() updateSeatLayoutTemplateDto: UpdateSeatLayoutTemplateDto,
    @Req() req: Request,
  ) {
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    return this.seatLayoutTemplatesService.update(
      +id,
      updateSeatLayoutTemplateDto,
      req.user as AuthenticatedUser,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  @ApiOperation({
    summary: 'Xóa một sơ đồ ghế (Admin xóa bất kỳ, Owner chỉ xóa của mình)',
  })
  @ApiResponse({
    status: 204,
    description: 'Sơ đồ ghế đã được xóa thành công.',
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa vì có xe đang sử dụng hoặc lý do khác.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sơ đồ ghế.' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    if (!req.user) {
      throw new Error(
        'User not found in request. Ensure JwtAuthGuard is applied.',
      );
    }
    await this.seatLayoutTemplatesService.remove(
      +id,
      req.user as AuthenticatedUser,
    );
  }
}
