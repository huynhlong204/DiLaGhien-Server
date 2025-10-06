import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Put, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
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
}