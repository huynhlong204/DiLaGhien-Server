import { Injectable, NotFoundException, ConflictException, Inject, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Chỉnh lại đường dẫn nếu cần
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsGateway } from './tickets.gateway';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { tickets as TicketModel } from '@prisma/client';

async function generateUniqueTicketCode(prisma: { tickets: { findUnique: (args: { where: { code: string } }) => Promise<any> } }): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string = 'VE';
  let isUnique = false;
  while (!isUnique) {
    code = 'VEX';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const existing = await prisma.tickets.findUnique({ where: { code } });
    if (!existing) isUnique = true;
  }
  return code;
}

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService, private ticketsGateway: TicketsGateway, @InjectRedis() private readonly redis: Redis,) { }

  async createTicketsAfterPayment(payload: any, orderId: string) {
    const { tripId, seats, passengerInfo, totalPrice } = payload;
    const customerId = payload.customerId || null; // Lấy customerId nếu có

    const createdTicketsWithDetails = await this.prisma.$transaction(async (tx) => {
      const createdTickets: any[] = [];
      for (const seatCode of seats) {
        const existingTicket = await tx.tickets.findFirst({
          where: { trip_id: tripId, seat_code: seatCode, NOT: { status: 'CANCELLED' } }
        });
        if (existingTicket) {
          throw new ConflictException(`Ghế ${seatCode} đã được đặt trong lúc bạn thanh toán.`);
        }

        const newTicket = await tx.tickets.create({
          data: {
            trip_id: tripId,
            customer_id: customerId,
            seat_code: seatCode,
            status: 'CONFIRMED',
            code: await generateUniqueTicketCode(tx),
            booking_time: new Date(),
            final_amount: totalPrice / seats.length,
            ticket_details: { create: { ...passengerInfo } },
            payments: {
              create: {
                method: 'VNPAY',
                amount: totalPrice / seats.length,
                status: 'SUCCESS',
                transaction_id: `${orderId}_${seatCode}`,
              },
            },
          },
        });
        createdTickets.push(newTicket);
      }

      // Query lại để lấy đủ thông tin quan hệ cho email
      const ticketIds = createdTickets.map(t => t.id);
      return tx.tickets.findMany({
        where: { id: { in: ticketIds } },
        include: {
          payments: true,
          trips: { include: { routes: true, vehicles: true } },
        },
      });
    });

    // Gửi update qua websocket cho các vé đã tạo thành công
    createdTicketsWithDetails.forEach(ticket => {
      const holdKey = `hold:trip:${tripId}:seat:${ticket.seat_code}`;
      this.redis.del(holdKey); // Xóa key giữ ghế
      this.ticketsGateway.emitSeatUpdate(tripId, ticket);
    });

    return { message: 'Tạo vé sau thanh toán thành công!', tickets: createdTicketsWithDetails };
  }

  async findOne(ticketId: number) {
    const ticket = await this.prisma.tickets.findUnique({
      where: { id: ticketId },
      include: { ticket_details: true, trips: true }
    });
    if (!ticket) throw new NotFoundException(`Không tìm thấy vé ID ${ticketId}`);
    return ticket;
  }

  /**
   * Cập nhật vé theo ID.
   * @param ticketId ID của vé cần cập nhật.
   * @param dto Dữ liệu cập nhật.
   * @returns Vé đã cập nhật.
   * @throws NotFoundException nếu vé không tồn tại.
   */
  async update(ticketId: number, dto: UpdateTicketDto) {
    const { status, note, ...detailsDto } = dto;

    const updatedTicket = await this.prisma.tickets.update({
      where: { id: ticketId },
      data: {
        status,
        note,
        ticket_details: {
          update: detailsDto
        },
      },
      include: { ticket_details: true, trips: true }
    });

    this.ticketsGateway.emitSeatUpdate(updatedTicket.trip_id, updatedTicket);
    return updatedTicket;
  }


  /**   * Hủy vé theo ID.
     * Chỉ thay đổi trạng thái của vé thành 'CANCELLED' thay vì xóa vé khỏi cơ sở dữ liệu. nhưng vẫn giữ lại thông tin vé để báo cáo và lịch sử. 
     * nếu người khác đặt vé cùng ghế thì sẽ không bị trùng lặp.
     * @param id ID của vé cần hủy.
     * @returns Vé đã hủy.
     * @throws NotFoundException nếu vé không tồn tại.
     * @throws ConflictException nếu vé đã bị hủy trước đó.
     *  
     * 
     */
  async cancelTicket(id: number) {
    const ticket = await this.prisma.tickets.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException(`Không tìm thấy vé với ID ${id}.`);
    if (ticket.status === 'CANCELLED') throw new ConflictException(`Vé với ID ${id} đã bị hủy trước đó.`);

    const cancelledTicket = await this.prisma.tickets.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { ticket_details: true, trips: true }
    });

    this.ticketsGateway.emitSeatUpdate(cancelledTicket.trip_id, cancelledTicket);
    return cancelledTicket;
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
        company_route: { include: { routes: { include: { from_location: true, to_location: true } } } },
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

  /**
   * Tạo một vé mới theo quy trình thủ công (nhân viên tạo).
   */
  async createManualTicket(dto: CreateTicketDto) {
    const { tripId, seatCode, customerInfo, paymentInfo, note, status } = dto;
    const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;

    // Transaction vẫn giữ nguyên để đảm bảo toàn vẹn dữ liệu
    const result = await this.prisma.$transaction(async (tx) => {
      const existingTicket = await tx.tickets.findUnique({
        where: { trip_id_seat_code: { trip_id: tripId, seat_code: seatCode } },
      });

      const email = customerInfo.email?.trim() || null;
      let customer;

      if (email) {
        customer = await tx.customers.upsert({
          where: { email },
          update: { phone: customerInfo.phone },
          create: {
            email,
            phone: customerInfo.phone,
            password_hash: `disabled_${Date.now()}`,
            customer_profiles: {
              create: { name: customerInfo.name },
            },
          },
        });
      } else {
        customer = await tx.customers.create({
          data: {
            email: `guest_${Date.now()}_${Math.random().toString(36).substring(2)}@noemail.com`,
            phone: customerInfo.phone,
            password_hash: `disabled_${Date.now()}`,
            customer_profiles: {
              create: { name: customerInfo.name },
            },
          },
        });
      }

      if (existingTicket && existingTicket.status === 'CANCELLED') {
        const reusedTicket = await tx.tickets.update({
          where: { id: existingTicket.id },
          data: {
            customer_id: customer.customer_id,
            status, note,
            booking_time: new Date(),
            ticket_details: {
              update: {
                passenger_name: customerInfo.name,
                passenger_phone: customerInfo.phone,
                passenger_email: email,
              },
            },
          },
          include: { ticket_details: true },
        });

        await tx.payments.create({
          data: {
            ticket_id: reusedTicket.id,
            amount: paymentInfo.amount,
            method: paymentInfo.method,
            status: paymentInfo.status,
            transaction_id: `manual_reuse_${reusedTicket.id}_${Date.now()}`,
          },
        });

        return { message: 'Khôi phục và đặt lại vé thành công!', ticket: reusedTicket };
      }

      if (existingTicket) {
        throw new ConflictException(`Ghế ${seatCode} đã được đặt.`);
      }

      const newTicketCode = await generateUniqueTicketCode(tx);
      const newTicket = await tx.tickets.create({
        data: {
          trip_id: tripId,
          customer_id: customer.customer_id,
          note, seat_code: seatCode, status,
          booking_time: new Date(),
          code: newTicketCode,
          ticket_details: {
            create: {
              passenger_name: customerInfo.name,
              passenger_phone: customerInfo.phone,
              passenger_email: email,
            },
          },
        },
        include: { ticket_details: true },
      });

      await tx.payments.create({
        data: {
          ticket_id: newTicket.id,
          amount: paymentInfo.amount,
          method: paymentInfo.method,
          status: paymentInfo.status,
          transaction_id: `manual_${newTicket.id}_${Date.now()}`,
        },
      });

      return { message: 'Đặt vé mới thành công!', ticket: newTicket };
    });

    await this.redis.del(holdKey);

    // ====================================================================
    // PHẦN TÍCH HỢP WEBSOCKET
    // ====================================================================
    // Sau khi transaction ở trên đã chạy thành công, `result` sẽ chứa vé mới.
    // Ta sẽ dùng nó để phát sự kiện đi.
    if (result && result.ticket) {
      this.ticketsGateway.emitSeatUpdate(result.ticket.trip_id, result.ticket);
    }
    // ====================================================================

    // Trả về kết quả cho HTTP request ban đầu.
    return result;
  }

  /**
     * Tạo vé mới cho người dùng (công khai), có xử lý cả khách vãng lai và người dùng đã đăng nhập.
     * @param dto Dữ liệu đặt vé từ client.
     * @param user Thông tin người dùng đã đăng nhập (nếu có), được cung cấp bởi OptionalJwtAuthGuard.
     */
  // src/tickets/tickets.service.ts

  // ...

  async createPublicBooking(dto: CreatePublicBookingDto, user?: { customer_id: number }) {
    // payload từ frontend có totalPrice, nhưng DTO của bạn chưa có, hãy thêm vào nhé.
    // Giả sử DTO đã được cập nhật:
    // export class CreatePublicBookingDto { ...; totalPrice: number; }
    const { tripId, seats, passengerInfo, pickupId, dropoffId, socketId, totalPrice } = dto;

    const customerId = user ? user.customer_id : null;

    const result = await this.prisma.$transaction(async (tx) => {
      // Kiểm tra giữ ghế
      for (const seatCode of seats) {
        const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;
        const holderId = await this.redis.get(holdKey);
        if (holderId !== socketId) {
          throw new ConflictException(`Ghế ${seatCode} đã hết hạn giữ hoặc được người khác chọn.`);
        }
      }

      const createdTickets: any[] = []; // Dùng any để chứa cả payment
      for (const seatCode of seats) {
        const existingTicket = await tx.tickets.findFirst({
          where: { trip_id: tripId, seat_code: seatCode, NOT: { status: 'CANCELLED' } }
        });
        if (existingTicket) {
          throw new ConflictException(`Ghế ${seatCode} đã được đặt trong lúc bạn thao tác.`);
        }

        const newTicket = await tx.tickets.create({
          data: {
            trip_id: tripId,
            customer_id: customerId,
            seat_code: seatCode,
            // Cập nhật trạng thái phù hợp hơn, ví dụ: CONFIRMED
            status: 'CONFIRMED',
            code: await generateUniqueTicketCode(tx),
            booking_time: new Date(),
            final_amount: totalPrice / seats.length, // Thêm giá tiền cho mỗi vé
            ticket_details: {
              create: {
                passenger_name: passengerInfo.fullName,
                passenger_phone: passengerInfo.phone,
                passenger_email: passengerInfo.email,
              },
            },
            shuttle_requests: {
              create: {
                pickup_location_id: pickupId,
                dropoff_location_id: dropoffId,
                status: 'PENDING',
              },
            },
            // Tạo luôn payment cho phương thức "Thanh toán khi lên xe"
            payments: {
              create: {
                method: 'ON_BOARD', // Hoặc 'CASH'
                amount: totalPrice / seats.length,
                status: 'PENDING', // Trạng thái chờ thanh toán
                transaction_id: `ONBOARD_${Date.now()}_${seatCode}`,
              }
            }
          },
          include: { payments: true } // Lấy luôn thông tin payment
        });
        createdTickets.push(newTicket);
      }
      return { message: 'Đặt vé thành công!', tickets: createdTickets };
    });

    // Các tác vụ phụ sau khi transaction thành công
    for (const ticket of result.tickets) {
      const holdKey = `hold:trip:${tripId}:seat:${ticket.seat_code}`;
      await this.redis.del(holdKey);
      this.ticketsGateway.emitSeatUpdate(tripId, { ...ticket, trip_id: tripId });
    }
    return result;
  }
}