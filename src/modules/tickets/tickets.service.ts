import { Injectable, NotFoundException, ConflictException, Inject, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Chỉnh lại đường dẫn nếu cần
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsGateway } from './tickets.gateway';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { CreatePublicBookingDto } from './dto/create-public-booking.dto';
import { Prisma, tickets as TicketModel } from '@prisma/client';
import { Buffer } from 'buffer';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as ExcelJS from 'exceljs';
import axios from 'axios';
import { PromotionService } from '../promotion/promotion.service';
import { MailerService } from '@nestjs-modules/mailer';
import moment from 'moment-timezone';

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
  private readonly logger = new Logger(TicketsService.name);
  constructor(private prisma: PrismaService, private ticketsGateway: TicketsGateway, @InjectRedis() private readonly redis: Redis,
    private promotionService: PromotionService,
    private readonly mailerService: MailerService,
  ) { }

  async createTicketsAfterPayment(payload: any, orderId: string) {
    const { tripId, seats, passengerInfo, totalPrice, customerId, originalPricePerTicket, promotionId } = payload;
    // const customerId = payload.customerId || null;

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
            original_price: originalPricePerTicket,
            final_amount: totalPrice / seats.length,
            promotion_id: promotionId || null,
            ticket_details: {
              create: {
                passenger_name: passengerInfo.fullName,
                passenger_phone: passengerInfo.phone,
                passenger_email: passengerInfo.email,
              },
            },
            payments: {
              create: {
                method: 'VNPAY',
                amount: totalPrice / seats.length,
                status: 'SUCCESS',
                transaction_id: `$VNP {orderId}_${seatCode}`,
              },
            },
          },
        });
        createdTickets.push(newTicket);
      }

      const ticketIds = createdTickets.map(t => t.id);
      return tx.tickets.findMany({
        where: { id: { in: ticketIds } },
        include: {
          ticket_details: true,
          payments: true,
          trips: {
            include: {
              company_route: {
                include: {
                  routes: {
                    include: {
                      from_location: true, // Lấy thông tin nơi đi
                      to_location: true,   // Lấy thông tin nơi đến
                    },
                  },
                },
              }
            },
          },
        },
      });
    });

    createdTicketsWithDetails.forEach(ticket => {
      const holdKey = `hold:trip:${tripId}:seat:${ticket.seat_code}`;
      this.redis.del(holdKey);

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
          include: { ticket_details: true, payments: true },
        },
      },
    });

    if (!tripWithTickets) {
      throw new NotFoundException(`Không tìm thấy chuyến đi với ID ${tripId}.`);
    }
    return tripWithTickets;
  }

  /**
   * Lấy lịch sử đặt vé của một nhà xe
   */

  async getTicketsByCompany(
    companyId: number,
    options: { page: number; limit: number },
    search?: string
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      trips: {
        company_route: {
          company_id: companyId,
        },
      },
    };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { ticket_details: { passenger_name: { contains: search, mode: 'insensitive' } } },
        { ticket_details: { passenger_phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Chạy 2 câu query song song để tối ưu hiệu suất
    const [total, tickets] = await this.prisma.$transaction([
      this.prisma.tickets.count({
        where: whereClause,
      }),
      this.prisma.tickets.findMany({
        skip: skip,
        take: limit,
        where: whereClause,
        include: {
          ticket_details: true,
          payments: true,
          trips: {
            include: {
              company_route: {
                include: {
                  routes: {
                    include: {
                      from_location: true,
                      to_location: true,
                    },
                  },
                },
              },
              vehicles: true, // Thêm vehicles để lấy biển số xe
            },
          },
        },
        orderBy: {
          booking_time: 'desc',
        },
      }),
    ]);

    // BƯỚC 2: Map lại dữ liệu tickets thành một cấu trúc gọn gàng hơn.
    const mappedData = tickets.map((ticket) => {
      const payment = ticket.payments[0];
      const trip = ticket.trips;

      return {
        ticketId: ticket.id,
        ticketCode: ticket.code,
        seatCode: ticket.seat_code,
        bookingTime: ticket.booking_time,
        status: ticket.status,
        passengerInfo: {
          name: ticket.ticket_details?.passenger_name,
          phone: ticket.ticket_details?.passenger_phone,
          email: ticket.ticket_details?.passenger_email,
        },
        paymentInfo: {
          method: payment?.method,
          status: payment?.status,
          amount: payment?.amount,
        },
        tripInfo: {
          tripId: trip.id,
          departureTime: trip.departure_time,
          route: `${trip.company_route.routes.from_location.name} → ${trip.company_route.routes.to_location.name}`,
          plateNumber: trip.vehicles?.plate_number ?? 'Chưa khởi tạo',
        },
      };
    });

    // BƯỚC 3: Trả về đối tượng cuối cùng bao gồm cả dữ liệu và thông tin phân trang.
    return {
      data: mappedData,
      pagination: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tạo một vé mới theo quy trình thủ công (nhân viên tạo).
   */
  async createManualTicket(dto: CreateTicketDto) {
    const { tripId, seatCode, customerInfo, paymentInfo, note, status } = dto;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra xem ghế đã có ai đặt chưa (ngoại trừ vé đã hủy)
      const existingTicket = await tx.tickets.findFirst({
        where: {
          trip_id: tripId,
          seat_code: seatCode,
          NOT: { status: 'CANCELLED' }
        },
      });

      if (existingTicket) {
        throw new ConflictException(`Ghế ${seatCode} đã được đặt.`);
      }

      // 2. Tìm hoặc tạo khách hàng (customer)
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
        // Tạo customer tạm thời nếu không có email
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

      // 3. Tạo vé và bản ghi thanh toán trong cùng một thao tác
      const newTicketCode = await generateUniqueTicketCode(tx);
      const newTicket = await tx.tickets.create({
        data: {
          trip_id: tripId,
          customer_id: customer.id, // Đã sửa: customer.id
          note,
          seat_code: seatCode,
          status, // Trạng thái vé (VD: 'CONFIRMED')
          booking_time: new Date(),
          code: newTicketCode,
          final_amount: paymentInfo.amount,
          ticket_details: {
            create: {
              passenger_name: customerInfo.name,
              passenger_phone: customerInfo.phone,
              passenger_email: email,
            },
          },
          // TẠO BẢN GHI THANH TOÁN ĐI KÈM
          payments: {
            create: {
              amount: paymentInfo.amount,
              method: paymentInfo.method, // VD: 'CASH', 'TRANSFER'
              status: paymentInfo.status, // VD: 'SUCCESS', 'PENDING'
              transaction_id: `MANUAL_${newTicketCode}_${Date.now()}`,
            },
          },
        },
        include: {
          ticket_details: true,
          payments: true,
        },
      });

      return { message: 'Đặt vé mới thành công!', ticket: newTicket };
    });

    // Phát sự kiện websocket sau khi transaction thành công
    if (result && result.ticket) {
      this.ticketsGateway.emitSeatUpdate(result.ticket.trip_id, result.ticket);
    }

    return result;
  }

  /**
     * Tạo vé mới cho người dùng (công khai), có xử lý cả khách vãng lai và người dùng đã đăng nhập.
     * Áp dụng cho hình thức "Thanh toán khi lên xe".
     * Sẽ xác thực khuyến mãi và gửi email xác nhận sau khi đặt vé thành công.
     * @param dto Dữ liệu đặt vé từ client.
     * @param user Thông tin người dùng đã đăng nhập (nếu có), được cung cấp bởi OptionalJwtAuthGuard.
     */
  async createPublicBooking(dto: CreatePublicBookingDto, user?: { customer_id: number }) {
    const { tripId, seats, passengerInfo, pickupId, dropoffId, socketId, totalPrice, promotion_code } = dto;

    const customerId = user ? user.customer_id : null;

    // --- BƯỚC 1: XÁC THỰC GIÁ VÀ KHUYẾN MÃI ---

    // 1.1. Lấy thông tin chuyến đi để biết giá gốc và companyId
    const trip = await this.prisma.trips.findUnique({
      where: { id: tripId },
      select: {
        price_default: true,
        company_route: { select: { company_id: true } }
      }
    });

    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến đi.');
    }

    const companyId = trip.company_route.company_id;
    const originalPricePerTicket = trip.price_default;
    const totalOriginalPrice = originalPricePerTicket * seats.length;

    let validatedFinalPrice = totalOriginalPrice;
    let promotionId: number | null = null;

    // 1.2. Xác thực mã khuyến mãi nếu có
    if (promotion_code) {
      try {
        const promotion = await this.promotionService.validatePromotion(promotion_code, companyId);

        // Tính toán lại giá
        let discountAmount = 0;
        if (promotion.discount_type === 'percentage') {
          discountAmount = (totalOriginalPrice * promotion.discount_value) / 100;
        } else { // fixed_amount
          discountAmount = promotion.discount_value;
        }

        validatedFinalPrice = totalOriginalPrice - discountAmount;
        if (validatedFinalPrice < 0) validatedFinalPrice = 0;

        promotionId = promotion.id;

      } catch (e) {
        // Ném lỗi nếu mã không hợp lệ (hết hạn, sai, ...)
        throw new BadRequestException(`Mã khuyến mãi không hợp lệ: ${e.message}`);
      }
    }

    // 1.3. KIỂM TRA AN NINH: So sánh giá đã tính với giá frontend gửi lên
    if (validatedFinalPrice !== totalPrice) {
      this.logger.warn(`Price mismatch for trip ${tripId}. Calculated: ${validatedFinalPrice}, Received: ${totalPrice}`);
      throw new BadRequestException('Giá tiền không khớp. Vui lòng thử lại.');
    }

    // --- BƯỚC 2: TẠO VÉ TRONG TRANSACTION ---

    const result = await this.prisma.$transaction(async (tx) => {
      // 2.1. Kiểm tra giữ ghế
      for (const seatCode of seats) {
        const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;
        const holderId = await this.redis.get(holdKey);
        if (holderId !== socketId) {
          throw new ConflictException(`Ghế ${seatCode} đã hết hạn giữ hoặc được người khác chọn.`);
        }
      }

      const createdTickets: any[] = []; // Dùng any để chứa cả payment

      // 2.2. Tạo vé cho từng ghế
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
            status: 'CONFIRMED', // Xác nhận ngay vì là thanh toán khi lên xe
            code: await generateUniqueTicketCode(tx),
            booking_time: new Date(),
            original_price: originalPricePerTicket,
            final_amount: validatedFinalPrice / seats.length, // Dùng giá đã xác thực
            promotion_id: promotionId, // Lưu ID khuyến mãi
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
            payments: {
              create: {
                method: 'ON_BOARD', // Phương thức thanh toán khi lên xe
                amount: validatedFinalPrice / seats.length, // Dùng giá đã xác thực
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

    // --- BƯỚC 3: CÁC TÁC VỤ SAU KHI TẠO VÉ ---

    // 3.1. Xóa Redis và emit WebSocket
    for (const ticket of result.tickets) {
      const holdKey = `hold:trip:${tripId}:seat:${ticket.seat_code}`;
      await this.redis.del(holdKey);
      this.ticketsGateway.emitSeatUpdate(tripId, { ...ticket, trip_id: tripId });
    }

    // 3.2. Gửi email xác nhận
    if (result && result.tickets.length > 0) {
      this.logger.log(`[ON_BOARD] Attempting to send email for ${result.tickets.length} tickets to ${passengerInfo.email}...`);
      try {
        // Lấy ID các vé vừa tạo
        const ticketIds = result.tickets.map(t => t.id);

        // Truy vấn lại đầy đủ thông tin vé để gửi mail
        const fullTickets = await this.prisma.tickets.findMany({
          where: { id: { in: ticketIds } },
          include: {
            ticket_details: true,
            payments: true,
            trips: {
              include: {
                company_route: {
                  include: {
                    routes: {
                      include: {
                        from_location: true,
                        to_location: true,
                      },
                    },
                  },
                }
              },
            },
          },
        });

        // Format dữ liệu cho email template
        const formattedTickets = fullTickets.map(ticket => ({
          ...ticket,
          formattedPrice: new Intl.NumberFormat('vi-VN').format(ticket.final_amount ?? 0),
          paymentDateFormatted: moment(ticket.booking_time).tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY'), // Dùng giờ đặt vé
          departureTimeFormatted: moment(ticket.trips.departure_time).tz('Asia/Ho_Chi_Minh').format('HH:mm'),
          departureDateFormatted: moment(ticket.trips.departure_time).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY'),
        }));

        const totalAmount = formattedTickets.reduce((sum, t) => sum + (t.final_amount ?? 0), 0);

        // Gửi mail
        await this.mailerService.sendMail({
          to: passengerInfo.email,
          subject: `Xác nhận đặt vé thành công - Mã vé [${formattedTickets.map(t => t.code).join(', ')}]`,
          template: './booking-confirmation', // Sử dụng template email chung
          context: {
            tickets: formattedTickets,
            passenger: formattedTickets[0].ticket_details,
            order: {
              code: formattedTickets[0].code, // Dùng mã vé đầu tiên làm mã đơn hàng
              total_amount: new Intl.NumberFormat('vi-VN').format(totalAmount),
            }
          },
        });
        this.logger.log(`✅ [ON_BOARD] Email sent successfully to ${passengerInfo.email}.`);

      } catch (emailError) {
        // Nếu gửi mail lỗi thì chỉ log, không báo lỗi cho người dùng
        this.logger.error(`❌ [ON_BOARD] FAILED TO SEND EMAIL to ${passengerInfo.email}:`, emailError);
      }
    }

    return result;
  }

  /**
   * HÀM MỚI: Xuất dữ liệu vé của công ty ra chuỗi CSV
   */
  async exportTicketsByCompany(companyId: number, search?: string): Promise<{ fileBuffer: Buffer; companyName: string }> {
    const company = await this.prisma.transport_companies.findUnique({
      where: { id: companyId },
      select: { name: true, avatar_url: true },
    });

    if (!company) {
      throw new NotFoundException(`Không tìm thấy công ty với ID ${companyId}`);
    }

    const whereClause: Prisma.ticketsWhereInput = {
      trips: {
        company_route: { company_id: companyId },
      },
    };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { ticket_details: { passenger_name: { contains: search, mode: 'insensitive' } } },
        { ticket_details: { passenger_phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const tickets = await this.prisma.tickets.findMany({
      where: whereClause,
      include: {
        ticket_details: true,
        payments: true,
        trips: {
          include: {
            company_route: {
              include: {
                routes: {
                  include: { from_location: true, to_location: true },
                },
              },
            },
            vehicles: true,
          },
        },
      },
      orderBy: { booking_time: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lịch sử đặt vé');

    if (company.avatar_url) {
      try {
        const response = await axios.get(company.avatar_url, { responseType: 'arraybuffer' });
        const imageId = workbook.addImage({
          buffer: response.data,
          extension: 'png',
        });
        worksheet.addImage(imageId, 'A1:B4');
      } catch (error) {
        console.error('Could not fetch company logo:', error);
      }
    }

    worksheet.mergeCells('C1:N2');
    const titleCell = worksheet.getCell('C1');
    titleCell.value = 'LỊCH SỬ ĐẶT VÉ';
    titleCell.font = { name: 'Arial', size: 24, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    worksheet.mergeCells('C3:N3');
    worksheet.getCell('C3').value = `Nhà xe: ${company.name}`;
    worksheet.getCell('C3').font = { name: 'Arial', size: 14, bold: true };
    worksheet.getCell('C3').alignment = { horizontal: 'center' };

    worksheet.mergeCells('C4:N4');
    worksheet.getCell('C4').value = `Ngày xuất: ${format(new Date(), 'dd/MM/yyyy')}`;
    worksheet.getCell('C4').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      'Mã vé', 'Số ghế', 'Trạng thái vé', 'Hành khách', 'Số điện thoại', 'Email',
      'Hành trình', 'Ngày đi', 'Giờ đi', 'Biển số xe', 'Giá vé',
      'Phương thức TT', 'Trạng thái TT', 'Ngày đặt'
    ]);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    const translateTicketStatus = (status: string | null | undefined): string => {
      if (!status) return 'Không xác định';
      switch (status.toUpperCase()) {
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'CANCELLED': return 'Đã hủy';
        case 'PENDING_PAYMENT': return 'Chờ thanh toán';
        case 'paid': return 'Đã xác nhận';
        default: return status;
      }
    };

    const translatePaymentMethod = (method: string | null | undefined): string => {
      if (!method) return 'Không xác định';
      switch (method.toUpperCase()) {
        case 'VNPAY': return 'VNPAY';
        case 'ON_BOARD': return 'Khi lên xe';
        case 'CASH': return 'Tiền mặt';
        default: return method;
      }
    };

    const translatePaymentStatus = (status: string | null | undefined): string => {
      if (!status) return 'Chưa khởi tạo';
      switch (status.toUpperCase()) {
        case 'SUCCESS': return 'Thành công';
        case 'PENDING': return 'Chờ xử lý';
        case 'FAILED': return 'Thất bại';
        default: return status;
      }
    };

    tickets.forEach(ticket => {
      const payment = ticket.payments[0];
      const trip = ticket.trips;
      worksheet.addRow([
        ticket.code,
        ticket.seat_code,
        translateTicketStatus(ticket.status),
        ticket.ticket_details?.passenger_name,
        ticket.ticket_details?.passenger_phone,
        ticket.ticket_details?.passenger_email,
        `${trip.company_route.routes.from_location.name} → ${trip.company_route.routes.to_location.name}`,
        format(trip.departure_time, 'dd/MM/yyyy', { locale: vi }),
        format(trip.departure_time, 'HH:mm', { locale: vi }),
        trip.vehicles?.plate_number ?? 'N/A',
        payment?.amount,
        translatePaymentMethod(payment?.method),
        translatePaymentStatus(payment?.status),
        format(ticket.booking_time, 'HH:mm dd/MM/yyyy', { locale: vi }),
      ]);
    });

    worksheet.getColumn(11).numFmt = '#,##0 "VNĐ"';

    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell!({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();
    return {
      fileBuffer: fileBuffer as unknown as Buffer,
      companyName: company.name,
    };
  }

  /**
   * HÀM MỚI: Xuất danh sách vé của một chuyến đi ra file Excel
   */
  async exportTicketsByTrip(tripId: number): Promise<{ fileBuffer: Buffer; fileName: string }> {
    // 1. Lấy dữ liệu chi tiết của chuyến đi
    const tripWithTickets = await this.prisma.trips.findUnique({
      where: { id: tripId },
      include: {
        company_route: {
          include: {
            routes: {
              include: { from_location: true, to_location: true },
            },
            transport_companies: {
              select: { name: true, avatar_url: true }
            }
          },
        },
        vehicles: true,
        tickets: {
          where: { status: { not: 'CANCELLED' } },
          include: { ticket_details: true, payments: true },
          orderBy: { seat_code: 'asc' }
        },
      },
    });

    if (!tripWithTickets) {
      throw new NotFoundException(`Không tìm thấy chuyến đi với ID ${tripId}.`);
    }

    const company = tripWithTickets.company_route.transport_companies;
    const tickets = tripWithTickets.tickets;

    // 2. Khởi tạo Workbook và Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách hành khách');

    // Thiết lập trang in để vừa khổ A4
    worksheet.pageSetup = {
      paperSize: 9,
      orientation: 'landscape',
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5, right: 0.5, top: 0.7, bottom: 0.7, header: 0.3, footer: 0.3
      }
    };

    // 3. Thêm logo
    if (company.avatar_url) {
      try {
        const response = await axios.get(company.avatar_url, { responseType: 'arraybuffer' });
        const imageId = workbook.addImage({
          buffer: response.data,
          extension: 'png'
        });
        worksheet.addImage(imageId, 'A1:B4');
      } catch (error) {
        console.error('Could not fetch company logo:', error);
      }
    }

    // 4. Thêm tiêu đề
    worksheet.mergeCells('C1:H2');
    const titleCell = worksheet.getCell('C1');
    titleCell.value = 'DANH SÁCH HÀNH KHÁCH';
    titleCell.font = { name: 'Arial', size: 24, bold: true };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    const route = tripWithTickets.company_route.routes;
    worksheet.mergeCells('C3:H3');
    worksheet.getCell('C3').value = `Hành trình: ${route.from_location.name} → ${route.to_location.name}`;
    worksheet.getCell('C3').font = { name: 'Arial', size: 12, bold: true };
    worksheet.getCell('C3').alignment = { horizontal: 'center' };

    worksheet.mergeCells('C4:H4');
    worksheet.getCell('C4').value = `Khởi hành: ${format(tripWithTickets.departure_time, 'HH:mm dd/MM/yyyy', { locale: vi })} - Biển số xe: ${tripWithTickets.vehicles?.plate_number ?? 'N/A'}`;
    worksheet.getCell('C4').font = { name: 'Arial', size: 12 };
    worksheet.getCell('C4').alignment = { horizontal: 'center' };

    worksheet.addRow([]);

    // 5. Thêm header
    const headerRow = worksheet.addRow([
      'STT', 'Mã vé', 'Số ghế', 'Tên hành khách', 'Số điện thoại', 'Phương thức TT', 'Số tiền', 'Ghi chú',
    ]);
    headerRow.height = 30;
    headerRow.alignment = { vertical: 'middle' };

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    const translatePaymentMethod = (method: string | null | undefined): string => {
      if (!method) return 'N/A';
      switch (method.toUpperCase()) {
        case 'VNPAY': return 'VNPAY';
        case 'ON_BOARD': return 'Khi lên xe';
        case 'CASH': return 'Tiền mặt';
        default: return method;
      }
    };

    // 6. Thêm dữ liệu
    tickets.forEach((ticket, index) => {
      const payment = ticket.payments[0];
      const rowData = [
        index + 1,
        ticket.code,
        ticket.seat_code,
        ticket.ticket_details?.passenger_name,
        ticket.ticket_details?.passenger_phone,
        translatePaymentMethod(payment?.method),
        payment?.amount,
        ticket.note,
      ];

      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 25;
      dataRow.alignment = { vertical: 'middle', wrapText: true };
      dataRow.font = { name: 'Arial', size: 12 };

      dataRow.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
    });

    worksheet.getColumn('G').numFmt = '#,##0 "đ"';

    // 7. Điều chỉnh độ rộng cột thủ công
    worksheet.getColumn('A').width = 5;    // STT
    worksheet.getColumn('B').width = 16;   // Mã vé
    worksheet.getColumn('C').width = 8;    // Số ghế
    worksheet.getColumn('D').width = 22;   // Tên hành khách
    worksheet.getColumn('E').width = 14;   // Số điện thoại
    worksheet.getColumn('F').width = 14;   // Phương thức TT
    worksheet.getColumn('G').width = 14;   // Số tiền
    worksheet.getColumn('H').width = 25;   // Ghi chú

    // 8. Tạo buffer và tên file
    const fileBuffer = await workbook.xlsx.writeBuffer();
    const tripRoute = tripWithTickets.company_route.routes;
    const rawRouteName = `${tripRoute.from_location.name}-den-${tripRoute.to_location.name}`;
    const sanitizedRouteName = rawRouteName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    const fileName = `danh-sach-hanh-khach-${sanitizedRouteName}-${format(tripWithTickets.departure_time, 'yyyy-MM-dd')}.xlsx`;

    return {
      fileBuffer: fileBuffer as unknown as Buffer,
      fileName,
    };
  }
}