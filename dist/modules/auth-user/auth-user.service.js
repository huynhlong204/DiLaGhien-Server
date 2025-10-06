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
exports.AuthUserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
const ticketSelectOptions = {
    code: true,
    seat_code: true,
    booking_time: true,
    note: true,
    ticket_details: {
        select: {
            passenger_name: true,
            passenger_email: true,
            passenger_phone: true
        }
    },
    trips: {
        select: {
            departure_time: true,
            company_route: {
                select: {
                    routes: {
                        select: {
                            from_location: { select: { name: true } },
                            to_location: { select: { name: true } }
                        }
                    },
                    transport_companies: {
                        select: {
                            name: true,
                            avatar_url: true
                        }
                    }
                }
            }
        }
    },
};
let AuthUserService = class AuthUserService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const { email, password, name, phone } = registerDto;
        const existingUser = await this.prisma.customers.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Email đã tồn tại.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.prisma.customers.create({
            data: {
                email,
                password_hash: hashedPassword,
                phone,
                customer_profiles: {
                    create: { name },
                },
            },
        });
        const { password_hash, ...result } = newUser;
        return result;
    }
    async validateUser(email, pass) {
        const user = await this.prisma.customers.findUnique({
            where: { email },
            include: { customer_profiles: true },
        });
        if (user && user.password_hash && (await bcrypt.compare(pass, user.password_hash))) {
            const { password_hash, refresh_token_hash, ...result } = user;
            return result;
        }
        return null;
    }
    async validateOAuthUser(details) {
        const user = await this.prisma.customers.findUnique({
            where: { email: details.email },
            include: { customer_profiles: true },
        });
        if (user)
            return user;
        const newUser = await this.prisma.customers.create({
            data: {
                email: details.email,
                password_hash: null,
                phone: null,
                customer_profiles: {
                    create: {
                        name: details.name,
                        avatar_url: details.avatar_url,
                    },
                },
            },
            include: { customer_profiles: true },
        });
        return newUser;
    }
    async getTokens(userId, email) {
        const payload = { sub: userId, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
            }),
        ]);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
    async updateRefreshTokenHash(userId, refreshToken) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.customers.update({
            where: { customer_id: userId },
            data: { refresh_token_hash: hash },
        });
    }
    async login(user) {
        const tokens = await this.getTokens(user.customer_id, user.email);
        await this.updateRefreshTokenHash(user.customer_id, tokens.refresh_token);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.customers.updateMany({
            where: {
                customer_id: userId,
                refresh_token_hash: { not: null },
            },
            data: { refresh_token_hash: null },
        });
    }
    async refreshToken(userId, refreshToken) {
        const user = await this.prisma.customers.findUnique({ where: { customer_id: userId } });
        if (!user || !user.refresh_token_hash) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        const isMatch = await bcrypt.compare(refreshToken, user.refresh_token_hash);
        if (!isMatch) {
            throw new common_1.ForbiddenException('Access Denied');
        }
        const tokens = await this.getTokens(user.customer_id, user.email);
        await this.updateRefreshTokenHash(user.customer_id, tokens.refresh_token);
        return tokens;
    }
    async getProfile(userId) {
        const user = await this.prisma.customers.findUnique({
            where: { customer_id: userId },
            select: {
                customer_id: true,
                email: true,
                phone: true,
                customer_profiles: true
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
    async updateUser(userId, dto) {
        const { name, gender, dateOfBirth, address, phone, avatar_url } = dto;
        const profileData = { name, gender, dateOfBirth, address, avatar_url };
        if (dateOfBirth) {
            profileData.dateOfBirth = new Date(dateOfBirth);
        }
        Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);
        const user = await this.prisma.customers.update({
            where: { customer_id: userId },
            data: {
                phone: phone,
                customer_profiles: {
                    update: profileData,
                },
            },
            select: {
                customer_id: true,
                email: true,
                phone: true,
                customer_profiles: true
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng.');
        }
        return user;
    }
    async getTicketsOfUser(userId) {
        const userTickets = await this.prisma.tickets.findMany({
            where: { customer_id: userId },
            orderBy: { booking_time: 'desc' },
            select: ticketSelectOptions,
        });
        return userTickets;
    }
    async getTicketByCode(userId, code) {
        const ticket = await this.prisma.tickets.findFirst({
            where: {
                code: code,
                customer_id: userId,
            },
            select: ticketSelectOptions,
        });
        if (!ticket) {
            throw new common_1.NotFoundException(`Không tìm thấy vé với mã ${code} hoặc bạn không có quyền truy cập.`);
        }
        return ticket;
    }
};
exports.AuthUserService = AuthUserService;
exports.AuthUserService = AuthUserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthUserService);
//# sourceMappingURL=auth-user.service.js.map