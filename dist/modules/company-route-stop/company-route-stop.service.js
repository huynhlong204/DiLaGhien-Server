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
exports.CompanyRouteStopsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CompanyRouteStopsService = class CompanyRouteStopsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCompanyRouteStopDto) {
        try {
            return await this.prisma.company_route_stops.create({
                data: createCompanyRouteStopDto,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    if (error.meta && Array.isArray(error.meta.target)) {
                        if (error.meta.target.includes('stop_order')) {
                            throw new common_1.ConflictException(`A stop point with order ${createCompanyRouteStopDto.stop_order} already exists for this company route.`);
                        }
                        if (error.meta.target.includes('location_id')) {
                            throw new common_1.ConflictException(`A stop point for location ${createCompanyRouteStopDto.location_id} already exists for this company route.`);
                        }
                    }
                    throw new common_1.ConflictException('Company route stop already exists with this combination.');
                }
            }
            throw error;
        }
    }
    async findAll() {
        return this.prisma.company_route_stops.findMany({
            include: {
                company_route: true,
                location: true,
            },
            orderBy: {
                stop_order: 'asc',
            },
        });
    }
    async findByCompanyRouteId(companyRouteId) {
        const stops = await this.prisma.company_route_stops.findMany({
            where: { company_route_id: companyRouteId },
            include: {
                location: true,
            },
            orderBy: {
                stop_order: 'asc',
            },
        });
        if (!stops.length) {
        }
        return stops;
    }
    async findOne(id) {
        const stopPoint = await this.prisma.company_route_stops.findUnique({
            where: { id },
            include: {
                company_route: true,
                location: true,
            },
        });
        if (!stopPoint) {
            throw new common_1.NotFoundException(`Company route stop with ID ${id} not found`);
        }
        return stopPoint;
    }
    async update(id, updateCompanyRouteStopDto) {
        try {
            const existingStopPoint = await this.prisma.company_route_stops.findUnique({ where: { id } });
            if (!existingStopPoint) {
                throw new common_1.NotFoundException(`Company route stop with ID ${id} not found`);
            }
            return await this.prisma.company_route_stops.update({
                where: { id },
                data: updateCompanyRouteStopDto,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.ConflictException('Update failed: The new stop order or location ID conflicts with an existing entry for this company route.');
                }
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Company route stop with ID ${id} not found for update.`);
                }
            }
            throw error;
        }
    }
    async remove(id) {
        try {
            await this.prisma.company_route_stops.delete({
                where: { id },
            });
            return { message: `Company route stop with ID ${id} deleted successfully` };
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new common_1.NotFoundException(`Company route stop with ID ${id} not found for deletion`);
                }
            }
            throw error;
        }
    }
};
exports.CompanyRouteStopsService = CompanyRouteStopsService;
exports.CompanyRouteStopsService = CompanyRouteStopsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyRouteStopsService);
//# sourceMappingURL=company-route-stop.service.js.map