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
exports.TripService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../auth/enums/role.enum");
const trip_status_enum_1 = require("./enums/trip-status.enum");
const date_fns_1 = require("date-fns");
let TripService = class TripService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRoleId(roleName) {
        const role = await this.prisma.roles.findUnique({
            where: { name: roleName },
            select: { role_id: true },
        });
        if (!role) {
            throw new Error(`Role '${roleName}' not found in database. Please seed roles.`);
        }
        return role.role_id;
    }
    checkOwnerCompanyAccess(user, companyId) {
        if (user.company_id === null || user.company_id !== companyId) {
            throw new common_1.ForbiddenException('Bạn không có quyền quản lý chuyến đi cho công ty này.');
        }
    }
    async validateTripAssociations(data, user, adminRoleId, ownerRoleId, driverRoleId) {
        const { company_route_id, vehicle_id, driver_id, seat_layout_template_id } = data;
        const companyRoute = await this.prisma.company_routes.findUnique({
            where: { id: company_route_id },
            include: {
                transport_companies: true,
                routes: true,
            },
        });
        if (!companyRoute) {
            throw new common_1.NotFoundException(`Liên kết công ty-tuyến đường với ID ${company_route_id} không tìm thấy.`);
        }
        if (!companyRoute.approved) {
            throw new common_1.BadRequestException('Tuyến đường này chưa được duyệt cho công ty này.');
        }
        const company_id = companyRoute.company_id;
        if (user.role_id === ownerRoleId && user.company_id !== company_id) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo/cập nhật chuyến đi cho công ty khác.');
        }
        if (vehicle_id !== null && vehicle_id !== undefined) {
            const vehicle = await this.prisma.vehicles.findUnique({ where: { id: vehicle_id } });
            if (!vehicle) {
                throw new common_1.NotFoundException(`Phương tiện với ID ${vehicle_id} không tìm thấy.`);
            }
            if (vehicle.company_id !== company_id) {
                throw new common_1.BadRequestException('Phương tiện này không thuộc về công ty đã chọn.');
            }
        }
        if (driver_id !== null && driver_id !== undefined) {
            const driverUser = await this.prisma.users.findUnique({ where: { user_id: driver_id } });
            if (!driverUser) {
                throw new common_1.NotFoundException(`Tài xế với ID ${driver_id} không tìm thấy.`);
            }
            if (driverUser.role_id !== driverRoleId) {
                throw new common_1.BadRequestException(`Người dùng với ID ${driver_id} không phải là tài xế.`);
            }
            if (driverUser.company_id !== company_id) {
                throw new common_1.BadRequestException('Tài xế này không thuộc về công ty đã chọn.');
            }
        }
        if (seat_layout_template_id !== null && seat_layout_template_id !== undefined) {
            const seatLayoutTemplate = await this.prisma.seat_layout_templates.findUnique({ where: { id: seat_layout_template_id } });
            if (!seatLayoutTemplate) {
                throw new common_1.NotFoundException(`Mẫu bố trí ghế với ID ${seat_layout_template_id} không tìm thấy.`);
            }
            if (seatLayoutTemplate.company_id !== null && seatLayoutTemplate.company_id !== company_id) {
                throw new common_1.BadRequestException('Mẫu bố trí ghế này không thuộc về công ty đã chọn.');
            }
        }
        return { companyId: company_id };
    }
    async create(createTripDto, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const driverRoleId = await this.getRoleId(role_enum_1.UserRole.DRIVER);
        if (user.role_id !== adminRoleId && user.role_id !== ownerRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo chuyến đi.');
        }
        await this.validateTripAssociations(createTripDto, user, adminRoleId, ownerRoleId, driverRoleId);
        const { company_route_id, vehicle_id, vehicle_type_id, driver_id, seat_layout_templatesId, departure_time, price_default, status } = createTripDto;
        return this.prisma.trips.create({
            data: {
                company_route_id,
                vehicle_id,
                vehicle_type_id,
                departure_time: new Date(departure_time),
                price_default,
                status: status,
                seat_layout_templatesId,
                driver_id,
            },
            include: {
                company_route: {
                    include: {
                        transport_companies: true,
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
                vehicles: true,
                vehicle_type: true,
                driver: {
                    select: { user_id: true, email: true, phone: true }
                },
                seat_layout_templates: true,
            },
        });
    }
    async createRecurring(createRecurringTripDto, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const driverRoleId = await this.getRoleId(role_enum_1.UserRole.DRIVER);
        if (user.role_id !== adminRoleId && user.role_id !== ownerRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo chuyến đi định kỳ.');
        }
        await this.validateTripAssociations(createRecurringTripDto, user, adminRoleId, ownerRoleId, driverRoleId);
        const { recurrenceDays, departure_time, company_route_id, vehicle_id, vehicle_type_id, driver_id, seat_layout_templatesId, price_default, status } = createRecurringTripDto;
        if (recurrenceDays <= 0) {
            throw new common_1.BadRequestException('Số lượng chuyến đi định kỳ (recurrenceDays) phải là một số nguyên dương.');
        }
        const createdTrips = [];
        let currentDepartureTime = new Date(departure_time);
        for (let i = 0; i < recurrenceDays; i++) {
            const tripSpecificDepartureTime = new Date(currentDepartureTime);
            const newTripData = {
                company_route_id,
                vehicle_id,
                vehicle_type_id,
                departure_time: tripSpecificDepartureTime,
                price_default,
                status: status || trip_status_enum_1.TripStatus.SCHEDULED,
                seat_layout_templatesId,
                driver_id,
            };
            const createdTrip = await this.prisma.trips.create({
                data: newTripData,
                include: {
                    company_route: {
                        include: {
                            transport_companies: true,
                            routes: {
                                include: {
                                    from_location: true,
                                    to_location: true,
                                },
                            },
                        },
                    },
                    vehicles: true,
                    vehicle_type: true,
                    driver: {
                        select: { user_id: true, email: true, phone: true },
                    },
                    seat_layout_templates: true,
                },
            });
            createdTrips.push(createdTrip);
            currentDepartureTime.setDate(currentDepartureTime.getDate() + 1);
        }
        return createdTrips;
    }
    async findAll(user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const whereClause = {};
        if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.ForbiddenException('Tài khoản của bạn không thuộc về một công ty nào.');
            }
            whereClause.company_route = {
                company_id: user.company_id
            };
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem danh sách chuyến đi.');
        }
        return this.prisma.trips.findMany({
            where: whereClause,
            include: {
                company_route: {
                    include: {
                        transport_companies: true,
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
                vehicles: true,
                vehicle_type: true,
                driver: {
                    select: { user_id: true, email: true, phone: true }
                },
                seat_layout_templates: true,
                tickets: true,
            },
            orderBy: {
                departure_time: 'desc',
            },
        });
    }
    async findOne(id, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const trip = await this.prisma.trips.findUnique({
            where: { id },
            include: {
                company_route: {
                    include: {
                        transport_companies: true,
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
                vehicles: true,
                vehicle_type: true,
                driver: {
                    select: { user_id: true, email: true, phone: true }
                },
                seat_layout_templates: true,
                tickets: true,
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
        }
        const tripCompanyId = trip.company_route?.company_id;
        if (tripCompanyId === undefined || tripCompanyId === null) {
            throw new common_1.NotFoundException('Không thể xác định công ty của chuyến đi này.');
        }
        if (user.role_id === ownerRoleId) {
            this.checkOwnerCompanyAccess(user, tripCompanyId);
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem chi tiết chuyến đi này.');
        }
        return trip;
    }
    async update(id, updateTripDto, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const driverRoleId = await this.getRoleId(role_enum_1.UserRole.DRIVER);
        const existingTrip = await this.prisma.trips.findUnique({
            where: { id },
            select: {
                company_route_id: true,
                status: true,
                vehicle_id: true,
                driver_id: true,
                seat_layout_templatesId: true,
                vehicle_type_id: true,
                price_default: true,
                departure_time: true,
                company_route: {
                    select: { company_id: true }
                }
            },
        });
        if (!existingTrip) {
            throw new common_1.NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
        }
        const currentCompanyId = existingTrip.company_route?.company_id;
        if (currentCompanyId === undefined || currentCompanyId === null) {
            throw new common_1.NotFoundException('Không thể xác định công ty của chuyến đi hiện có.');
        }
        if (user.role_id === ownerRoleId) {
            this.checkOwnerCompanyAccess(user, currentCompanyId);
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật chuyến đi này.');
        }
        if ([trip_status_enum_1.TripStatus.ACTIVE, trip_status_enum_1.TripStatus.COMPLETED, trip_status_enum_1.TripStatus.CANCELLED].includes(existingTrip.status)) {
            throw new common_1.BadRequestException('Không thể cập nhật chuyến đi đã khởi hành, hoàn thành hoặc bị hủy.');
        }
        const { company_route_id, vehicle_id, driver_id, seat_layout_templatesId, departure_time, price_default, status } = updateTripDto;
        if (company_route_id !== undefined && company_route_id !== existingTrip.company_route_id) {
            throw new common_1.BadRequestException('Không thể thay đổi liên kết tuyến đường của chuyến đi sau khi tạo. Vui lòng tạo chuyến đi mới.');
        }
        const dataToValidate = { company_route_id: existingTrip.company_route_id };
        if (vehicle_id !== undefined)
            dataToValidate.vehicle_id = vehicle_id;
        if (driver_id !== undefined)
            dataToValidate.driver_id = driver_id;
        if (seat_layout_templatesId !== undefined)
            dataToValidate.seat_layout_template_id = seat_layout_templatesId;
        if (vehicle_id !== undefined || driver_id !== undefined || seat_layout_templatesId !== undefined) {
            await this.validateTripAssociations(dataToValidate, user, adminRoleId, ownerRoleId, driverRoleId);
        }
        const dataToUpdate = {};
        if (departure_time !== undefined)
            dataToUpdate.departure_time = new Date(departure_time);
        if (price_default !== undefined)
            dataToUpdate.price_default = price_default;
        if (status !== undefined)
            dataToUpdate.status = status;
        if (updateTripDto.vehicle_type_id !== undefined && updateTripDto.vehicle_type_id !== null) {
            const vehicleTypeExists = await this.prisma.vehicle_types.findUnique({
                where: { id: updateTripDto.vehicle_type_id }
            });
            if (!vehicleTypeExists) {
                throw new common_1.BadRequestException('Loại phương tiện không tồn tại');
            }
            dataToUpdate.vehicle_type = { connect: { id: updateTripDto.vehicle_type_id } };
        }
        if (vehicle_id !== undefined) {
            dataToUpdate.vehicles = vehicle_id === null ? { disconnect: true } : { connect: { id: vehicle_id } };
        }
        if (existingTrip.vehicle_type_id !== undefined && existingTrip.vehicle_type_id !== null) {
            dataToUpdate.vehicle_type = { connect: { id: existingTrip.vehicle_type_id } };
        }
        if (driver_id !== undefined) {
            dataToUpdate.driver = driver_id === null ? { disconnect: true } : { connect: { user_id: driver_id } };
        }
        if (seat_layout_templatesId !== undefined) {
            dataToUpdate.seat_layout_templates = seat_layout_templatesId === null
                ? { disconnect: true }
                : { connect: { id: seat_layout_templatesId } };
        }
        return this.prisma.trips.update({
            where: { id },
            data: dataToUpdate,
            include: {
                company_route: {
                    include: {
                        transport_companies: true,
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
                vehicles: true,
                vehicle_type: true,
                driver: {
                    select: { user_id: true, email: true, phone: true }
                },
                seat_layout_templates: true,
            },
        });
    }
    async updateTripStatus(id, status, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const existingTrip = await this.prisma.trips.findUnique({
            where: { id },
            select: {
                status: true,
                company_route: {
                    select: { company_id: true }
                }
            },
        });
        if (!existingTrip) {
            throw new common_1.NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
        }
        const tripCompanyId = existingTrip.company_route?.company_id;
        if (tripCompanyId === undefined || tripCompanyId === null) {
            throw new common_1.NotFoundException('Không thể xác định công ty của chuyến đi này.');
        }
        if (user.role_id === ownerRoleId) {
            this.checkOwnerCompanyAccess(user, tripCompanyId);
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật trạng thái chuyến đi này.');
        }
        if (existingTrip.status === trip_status_enum_1.TripStatus.COMPLETED || existingTrip.status === trip_status_enum_1.TripStatus.CANCELLED) {
            throw new common_1.BadRequestException('Không thể thay đổi trạng thái của chuyến đi đã hoàn thành hoặc bị hủy.');
        }
        if (status === trip_status_enum_1.TripStatus.ACTIVE && existingTrip.status !== trip_status_enum_1.TripStatus.SCHEDULED && existingTrip.status !== trip_status_enum_1.TripStatus.PENDING) {
            throw new common_1.BadRequestException('Chuyến đi chỉ có thể chuyển sang trạng thái "active" từ "scheduled" hoặc "pending".');
        }
        if (status === trip_status_enum_1.TripStatus.COMPLETED && existingTrip.status !== trip_status_enum_1.TripStatus.ACTIVE) {
            throw new common_1.BadRequestException('Chuyến đi chỉ có thể chuyển sang trạng thái "completed" từ "active".');
        }
        if (status === trip_status_enum_1.TripStatus.CANCELLED && existingTrip.status === trip_status_enum_1.TripStatus.COMPLETED) {
            throw new common_1.BadRequestException('Không thể hủy chuyến đi đã hoàn thành.');
        }
        return this.prisma.trips.update({
            where: { id },
            data: { status },
            include: {
                company_route: {
                    include: {
                        transport_companies: true,
                        routes: {
                            include: {
                                from_location: true,
                                to_location: true,
                            },
                        },
                    },
                },
                vehicles: true,
                vehicle_type: true,
                driver: {
                    select: { user_id: true, email: true, phone: true }
                },
                seat_layout_templates: true,
            },
        });
    }
    async remove(id, user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        const existingTrip = await this.prisma.trips.findUnique({
            where: { id },
            select: {
                status: true,
                company_route: {
                    select: { company_id: true }
                }
            },
        });
        if (!existingTrip) {
            throw new common_1.NotFoundException(`Chuyến đi với ID ${id} không tìm thấy.`);
        }
        const tripCompanyId = existingTrip.company_route?.company_id;
        if (tripCompanyId === undefined || tripCompanyId === null) {
            throw new common_1.NotFoundException('Không thể xác định công ty của chuyến đi này.');
        }
        if (user.role_id === ownerRoleId) {
            this.checkOwnerCompanyAccess(user, tripCompanyId);
        }
        else if (user.role_id !== adminRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa chuyến đi này.');
        }
        if (existingTrip.status !== trip_status_enum_1.TripStatus.SCHEDULED && existingTrip.status !== trip_status_enum_1.TripStatus.PENDING) {
            throw new common_1.BadRequestException('Không thể xóa chuyến đi đã bắt đầu, hoàn thành hoặc hủy bỏ.');
        }
        const ticketsCount = await this.prisma.tickets.count({
            where: { trip_id: id, status: { not: 'cancelled' } }
        });
        if (ticketsCount > 0) {
            throw new common_1.BadRequestException(`Không thể xóa chuyến đi này vì đã có ${ticketsCount} vé được đặt.`);
        }
        await this.prisma.trips.delete({
            where: { id },
        });
    }
    async findBookingsByTrip(tripId) {
        return this.prisma.tickets.findMany({
            where: {
                trip_id: tripId,
            },
            select: {
                id: true,
                seat_code: true,
                status: true,
                customers: {
                    select: {
                        phone: true,
                        customer_profiles: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                seat_code: 'asc',
            },
        });
    }
    async findTripsByRouteAndDate(company_route_id, date) {
        const selectedDay = new Date(date);
        const startDate = (0, date_fns_1.startOfDay)(selectedDay);
        const endDate = (0, date_fns_1.endOfDay)(selectedDay);
        const trips = await this.prisma.trips.findMany({
            where: {
                company_route_id,
                departure_time: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    notIn: [trip_status_enum_1.TripStatus.CANCELLED, trip_status_enum_1.TripStatus.COMPLETED],
                },
            },
            include: {
                driver: true,
                company_route: true,
                vehicles: {
                    include: {
                        vehicle_type: true,
                        seat_layout_template: true,
                    }
                },
                seat_layout_templates: true,
                tickets: {
                    where: { status: { not: 'CANCELLED' } }
                },
            },
            orderBy: {
                departure_time: 'asc',
            }
        });
        return trips;
    }
};
exports.TripService = TripService;
exports.TripService = TripService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripService);
//# sourceMappingURL=trips.service.js.map