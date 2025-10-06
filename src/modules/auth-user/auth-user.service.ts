// src/auth-user/auth-user.service.ts
import { Injectable, ConflictException, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { OAuthUserDto } from './dto/oauth-user.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';

const ticketSelectOptions: Prisma.ticketsSelect = {
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

@Injectable()
export class AuthUserService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { email, password, name, phone } = registerDto;
        const existingUser = await this.prisma.customers.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại.');
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

    async validateUser(email: string, pass: string): Promise<any> {
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

    async validateOAuthUser(details: OAuthUserDto) {
        const user = await this.prisma.customers.findUnique({
            where: { email: details.email },
            include: { customer_profiles: true },
        });
        if (user) return user;

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

    async getTokens(userId: number, email: string) {
        const payload = { sub: userId, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
            }),
        ]);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async updateRefreshTokenHash(userId: number, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.customers.update({
            where: { customer_id: userId },
            data: { refresh_token_hash: hash },
        });
    }

    async login(user: any) {
        const tokens = await this.getTokens(user.customer_id, user.email);
        await this.updateRefreshTokenHash(user.customer_id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: number) {
        await this.prisma.customers.updateMany({
            where: {
                customer_id: userId,
                refresh_token_hash: { not: null },
            },
            data: { refresh_token_hash: null },
        });
    }

    async refreshToken(userId: number, refreshToken: string) {
        const user = await this.prisma.customers.findUnique({ where: { customer_id: userId } });
        if (!user || !user.refresh_token_hash) {
            throw new ForbiddenException('Access Denied');
        }

        const isMatch = await bcrypt.compare(refreshToken, user.refresh_token_hash);
        if (!isMatch) {
            throw new ForbiddenException('Access Denied');
        }

        const tokens = await this.getTokens(user.customer_id, user.email);
        await this.updateRefreshTokenHash(user.customer_id, tokens.refresh_token);
        return tokens;
    }

    async getProfile(userId: number) {
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
            throw new UnauthorizedException();
        }
        return user;
    }

    async updateUser(userId: number, dto: UpdateUserDto) {
        const { name, gender, dateOfBirth, address, phone, avatar_url } = dto;

        const profileData: any = { name, gender, dateOfBirth, address, avatar_url };

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
            throw new NotFoundException('Không tìm thấy người dùng.');
        }

        return user;
    }

    async getTicketsOfUser(userId: number) {
        const userTickets = await this.prisma.tickets.findMany({
            where: { customer_id: userId },
            orderBy: { booking_time: 'desc' },
            select: ticketSelectOptions,
        });
        return userTickets;
    }

    async getTicketByCode(userId: number, code: string) {
        const ticket = await this.prisma.tickets.findFirst({
            where: {
                code: code,
                customer_id: userId,
            },
            select: ticketSelectOptions,
        });

        if (!ticket) {
            throw new NotFoundException(`Không tìm thấy vé với mã ${code} hoặc bạn không có quyền truy cập.`);
        }

        return ticket;
    }
}