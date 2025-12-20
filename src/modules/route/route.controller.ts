import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { RouteService } from './route.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  CreateCompanyRouteDto,
} from './dto/index.dto';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
import { Request } from 'express';

@Controller('routes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  // --- CÁC ENDPOINT DÀNH RIÊNG CHO CÔNG TY (OWNER) ---
  // Giữ nguyên thứ tự để ưu tiên các đường dẫn cụ thể

  @Post('company/request')
  @Roles(UserRole.OWNER, UserRole.NHANVIEN)
  async requestRouteByCompany(
    @Body('route_id', ParseIntPipe) routeId: number,
    @Req() req: Request,
  ) {
    return this.routeService.requestRouteByCompany(
      routeId,
      req.user as AuthenticatedUser,
    );
  }

  @Get('company/my-routes')
  @Roles(UserRole.OWNER, UserRole.NHANVIEN)
  async getMyCompanyRoutes(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    console.log(user);
    if (!user.company_id) {
      throw new UnauthorizedException(
        'Thông tin công ty không tìm thấy trong token.',
      );
    }
    return this.routeService.getRoutesByCompanyId(user.company_id, user);
  }

  @Delete('company/my-routes/:routeId')
  @Roles(UserRole.OWNER, UserRole.NHANVIEN)
  async removeMyCompanyRoute(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Req() req: Request,
  ) {
    return this.routeService.removeMyCompanyRoute(
      routeId,
      req.user as AuthenticatedUser,
    );
  }

  // --- CÁC ENDPOINT CHUNG / ADMIN ---

  @Get('available') // <-- DI CHUYỂN LÊN TRÊN NÀY
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.NHANVIEN)
  async getAllAvailableRoutes(@Req() req: Request) {
    return this.routeService.getAllRoutesWithoutCompanyInfo(
      req.user as AuthenticatedUser,
    );
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createRouteDto: CreateRouteDto, @Req() req: Request) {
    return this.routeService.createRoute(
      createRouteDto,
      req.user as AuthenticatedUser,
    );
  }

  @Get() // Endpoint getAll được mở rộng để hỗ trợ lọc theo companyId
  @Roles(UserRole.ADMIN)
  async getAllRoutesForAdmin(
    @Req() req: Request,
    @Query('companyId', new ParseIntPipe({ optional: true }))
    companyId?: number,
  ) {
    if (companyId !== undefined) {
      return this.routeService.getRoutesByCompanyId(
        companyId,
        req.user as AuthenticatedUser,
      );
    } else {
      return this.routeService.getAllRoutes(req.user as AuthenticatedUser);
    }
  }

  @Get(':id') // <-- Giờ nằm dưới @Get('available')
  @Roles(UserRole.ADMIN)
  async getOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.routeService.getOneRoute(id, req.user as AuthenticatedUser);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRouteDto: UpdateRouteDto,
    @Req() req: Request,
  ) {
    return this.routeService.updateRoute(
      id,
      updateRouteDto,
      req.user as AuthenticatedUser,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.routeService.deleteRoute(id, req.user as AuthenticatedUser);
  }

  @Post('assign')
  @Roles(UserRole.ADMIN)
  async assignRouteToCompany(
    @Body() createCompanyRouteDto: CreateCompanyRouteDto,
    @Req() req: Request,
  ) {
    return this.routeService.assignRouteToCompany(
      createCompanyRouteDto,
      req.user as AuthenticatedUser,
    );
  }

  @Delete(':companyId/:routeId')
  @Roles(UserRole.ADMIN)
  async removeCompanyRoute(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('routeId', ParseIntPipe) routeId: number,
    @Req() req: Request,
  ) {
    return this.routeService.removeCompanyRoute(
      companyId,
      routeId,
      req.user as AuthenticatedUser,
    );
  }

  @Patch(':companyId/:routeId/approve')
  @Roles(UserRole.ADMIN)
  async updateApprovalStatus(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Param('routeId', ParseIntPipe) routeId: number,
    @Body('approved') approved: boolean,
    @Req() req: Request,
  ) {
    return this.routeService.updateCompanyRouteApproval(
      companyId,
      routeId,
      approved,
      req.user as AuthenticatedUser,
    );
  }
}
