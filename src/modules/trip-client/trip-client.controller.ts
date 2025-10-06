// @/src/trip-client/trip-client.controller.ts

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TripClientService, FindTripsQueryDto } from './trip-client.service';




@Controller('trip-client') // Endpoint sẽ là /trip-client
export class TripClientController {
  constructor(private readonly tripClientService: TripClientService) { }

  @Get() // Chấp nhận request GET tại /trip-client
  // Sử dụng @Query() để lấy các tham số từ URL (ví dụ: /trip-client?from=1&to=2)
  findAll(@Query() query: FindTripsQueryDto) {
    return this.tripClientService.findAll(query);
  }

  @Get(':id')
  getTripDetailsForBooking(@Param('id', ParseIntPipe) id: number) {
    // Gọi lại hàm đã có sẵn trong service để lấy chi tiết chuyến đi
    return this.tripClientService.getTicketsByTrip(id);
  }

}