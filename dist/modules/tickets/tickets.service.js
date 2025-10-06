"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tickets_gateway_1 = require("./tickets.gateway");
const ioredis_1 = require("ioredis");
const ioredis_2 = require("@nestjs-modules/ioredis");
async function generateUniqueTicketCode(prisma) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VE';
    let isUnique = false;
    while (!isUnique) {
        code = 'VE';
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        const existing = await prisma.tickets.findUnique({ where: { code } });
        if (!existing)
            isUnique = true;
    }
    return code;
}
let TicketsService = class TicketsService {
    prisma;
    ticketsGateway;
    redis;
    constructor(prisma, ticketsGateway, redis) {
        this.prisma = prisma;
        this.ticketsGateway = ticketsGateway;
        this.redis = redis;
    }
    async findOne(ticketId) {
        const ticket = await this.prisma.tickets.findUnique({
            where: { id: ticketId },
            include: { ticket_details: true, trips: true }
        });
        if (!ticket)
            throw new common_1.NotFoundException(`Không tìm thấy vé ID ${ticketId}`);
        return ticket;
    }
    async update(ticketId, dto) {
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
    async cancelTicket(id) {
        const ticket = await this.prisma.tickets.findUnique({ where: { id } });
        if (!ticket)
            throw new common_1.NotFoundException(`Không tìm thấy vé với ID ${id}.`);
        if (ticket.status === 'CANCELLED')
            throw new common_1.ConflictException(`Vé với ID ${id} đã bị hủy trước đó.`);
        const cancelledTicket = await this.prisma.tickets.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: { ticket_details: true, trips: true }
        });
        this.ticketsGateway.emitSeatUpdate(cancelledTicket.trip_id, cancelledTicket);
        return cancelledTicket;
    }
    async getTicketsByTrip(tripId) {
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
            throw new common_1.NotFoundException(`Không tìm thấy chuyến đi với ID ${tripId}.`);
        }
        return tripWithTickets;
    }
    async createManualTicket(dto) {
        const { tripId, seatCode, customerInfo, paymentInfo, note, status } = dto;
        const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;
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
            }
            else {
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
                throw new common_1.ConflictException(`Ghế ${seatCode} đã được đặt.`);
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
        if (result && result.ticket) {
            this.ticketsGateway.emitSeatUpdate(result.ticket.trip_id, result.ticket);
        }
        return result;
    }
    async createPublicBooking(dto, user) {
        const { tripId, seats, passengerInfo, pickupId, dropoffId, socketId } = dto;
        const customerId = user ? user.customer_id : null;
        const result = await this.prisma.$transaction(async (tx) => {
            for (const seatCode of seats) {
                const holdKey = `hold:trip:${tripId}:seat:${seatCode}`;
                const holderId = await this.redis.get(holdKey);
                if (holderId !== socketId) {
                    throw new common_1.ConflictException(`Ghế ${seatCode} đã hết hạn giữ hoặc được người khác chọn.`);
                }
            }
            const createdTickets = [];
            for (const seatCode of seats) {
                const existingTicket = await tx.tickets.findFirst({
                    where: { trip_id: tripId, seat_code: seatCode, NOT: { status: 'CANCELLED' } }
                });
                if (existingTicket) {
                    throw new common_1.ConflictException(`Ghế ${seatCode} đã được đặt trong lúc bạn thao tác.`);
                }
                const newTicket = await tx.tickets.create({
                    data: {
                        trip_id: tripId,
                        customer_id: customerId,
                        seat_code: seatCode,
                        status: 'RESERVED',
                        code: await generateUniqueTicketCode(tx),
                        booking_time: new Date(),
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
                    },
                });
                createdTickets.push(newTicket);
            }
            return { message: 'Đặt vé thành công!', tickets: createdTickets };
        });
        for (const ticket of result.tickets) {
            const holdKey = `hold:trip:${tripId}:seat:${ticket.seat_code}`;
            await this.redis.del(holdKey);
            this.ticketsGateway.emitSeatUpdate(tripId, { ...ticket, trip_id: tripId });
        }
        return result;
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, ioredis_2.InjectRedis)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, tickets_gateway_1.TicketsGateway, ioredis_1.Redis])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map