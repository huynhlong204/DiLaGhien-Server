import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Put, Request, Query, Res } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Response } from 'express';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/enums/role.enum';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { OptionalJwtAuthGuard } from '../auth-user/guards/optional-jwt-auth.guard';

@Controller('tickets')

export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Get('/trip/:tripId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getTicketsByTrip(@Param('tripId', ParseIntPipe) tripId: number) {
    return this.ticketsService.getTicketsByTrip(tripId);
  }

  @Post('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  createManualTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.createManualTicket(createTicketDto);
  }

  @Post('/cancel/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  cancelTicket(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.cancelTicket(id);
  }

  @Post('/public')
  @UseGuards(OptionalJwtAuthGuard)
  createPublicBooking(
    @Body() createPublicBookingDto: CreatePublicBookingDto,
    @Request() req, // Inject vào toàn bộ đối tượng request
  ) {
    // req.user sẽ có giá trị nếu người dùng đã đăng nhập,
    // và sẽ là `undefined` nếu là khách vãng lai.
    const user = req.user;

    // Truyền cả DTO và thông tin user (nếu có) xuống service
    return this.ticketsService.createPublicBooking(createPublicBookingDto, user);
  }

  // Lấy lịch sử đặt vé của một công ty 
  @Get('/history/company/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getBookingHistoryByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    // Thêm query params cho phân trang, với giá trị mặc định
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.ticketsService.getTicketsByCompany(companyId, { page, limit }, search);
  }

  /**
   *  Xuất lịch sử đặt vé ra file CSV
   */
  @Get('/history/company/:companyId/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async exportBookingHistoryByCompany(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('search') search: string | undefined,
    @Res() res: Response,
  ) {
    const { fileBuffer, companyName } = await this.ticketsService.exportTicketsByCompany(companyId, search);

    const sanitizedCompanyName = companyName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toLowerCase();

    const fileName = `lich-su-dat-ve-${sanitizedCompanyName}-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileBuffer);
  }

  /**
   * ENDPOINT MỚI: Xuất danh sách hành khách của một chuyến đi ra file Excel
   */
  @Get('/trip/:tripId/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async exportTicketsByTrip(
    @Param('tripId', ParseIntPipe) tripId: number,
    @Res() res: Response,
  ) {
    const { fileBuffer, fileName } = await this.ticketsService.exportTicketsByTrip(tripId);

    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);

    res.send(fileBuffer);
  }
}