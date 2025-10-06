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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripClientService = exports.FindTripsQueryDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
const class_validator_1 = require("class-validator");
class FindTripsQueryDto {
    from;
    to;
    date;
}
exports.FindTripsQueryDto = FindTripsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindTripsQueryDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FindTripsQueryDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], FindTripsQueryDto.prototype, "date", void 0);
let TripClientService = class TripClientService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { from, to, date } = query;
        if (!from || !to || !date) {
            return [];
        }
        const potentialTrips = await this.prisma.trips.findMany({
            where: {
                departure_time: {
                    gte: (0, date_fns_1.startOfDay)(new Date(date)),
                    lt: (0, date_fns_1.endOfDay)(new Date(date)),
                },
                AND: [
                    {
                        company_route: {
                            OR: [
                                { routes: { from_location: { name: from } } },
                                { stops: { some: { location: { name: from } } } },
                            ],
                        },
                    },
                    {
                        company_route: {
                            OR: [
                                { routes: { to_location: { name: to } } },
                                { stops: { some: { location: { name: to } } } },
                            ],
                        },
                    },
                ],
            },
            include: {
                company_route: {
                    include: {
                        transport_companies: true,
                        stops: {
                            include: { location: true },
                            orderBy: { stop_order: 'asc' },
                        },
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
                vehicles: { include: { vehicle_type: true, seat_layout_template: true } },
                tickets: { where: { status: 'confirmed' } },
            },
            orderBy: {
                departure_time: 'asc',
            },
        });
        const finalTrips = potentialTrips.filter(trip => {
            if (!trip.company_route?.routes)
                return false;
            const orderedLocations = [];
            orderedLocations.push(trip.company_route.routes.from_location);
            trip.company_route.stops.forEach(stop => {
                if (stop.location)
                    orderedLocations.push(stop.location);
            });
            orderedLocations.push(trip.company_route.routes.to_location);
            const fromIndex = orderedLocations.findIndex(loc => loc.name === from);
            const toIndex = orderedLocations.findIndex(loc => loc.name === to);
            return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
        });
        return finalTrips;
    }
    async getTicketsByTrip(tripId) {
        const tripWithTickets = await this.prisma.trips.findUnique({
            where: { id: tripId },
            select: {
                id: true,
                departure_time: true,
                price_default: true,
                company_route: {
                    include: {
                        transport_companies: true,
                        stops: {
                            include: { location: true },
                            orderBy: { stop_order: 'asc' },
                        },
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
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
};
exports.TripClientService = TripClientService;
exports.TripClientService = TripClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripClientService);
//# sourceMappingURL=trip-client.service.js.map