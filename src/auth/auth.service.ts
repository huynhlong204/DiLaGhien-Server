import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');



@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) { }

    async adminLogin(loginDto: LoginDto) {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
            include: { roles: true },
        });

        if (!user) throw new UnauthorizedException('Email không tồn tồn tại.');
        if (!user.roles || user.roles.name !== 'admin' || user.company_id !== null) throw new ForbiddenException('Chỉ admin được phép đăng nhập và không được liên kết với công ty.');
        if (!user.password_hash) throw new UnauthorizedException('Dữ liệu user không hợp lệ.');

        const isValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isValid) throw new UnauthorizedException('Mật khẩu không đúng.');

        return this.createSessionAndTokens(user);
    }

    async companyLogin(loginDto: LoginDto) {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
            include: { roles: true, transport_company: true },
        });

        if (!user) throw new UnauthorizedException('Email không tồn tại.');
        if (!user.roles || user.roles.name !== 'owner' || !user.company_id) throw new ForbiddenException('Chỉ chủ nhà xe được phép đăng nhập và phải liên kết với một công ty.');
        if (!user.password_hash) throw new UnauthorizedException('Dữ liệu user không hợp lệ.');

        const isValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isValid) throw new UnauthorizedException('Mật khẩu không đúng.');

        return this.createSessionAndTokens(user);
    }

    // private _setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {

    //     // const isProd = process.env.NODE_ENV === 'production';

    //     res.cookie('access_token', accessToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //         path: '/',
    //         maxAge: 1 * 60 * 60 * 1000, // 1 giờ
    //     });

    //     res.cookie('refresh_token', refreshToken, {
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === 'production',
    //         sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    //         path: '/',
    //         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    //     });

    // }

    private async createSessionAndTokens(user: any) {
        const companyId = user.company_id;
        const accessToken = this.generateAccessToken(user.user_id, user.role_id, companyId);
        const refreshToken = this.generateRefreshToken(user.user_id, user.role_id, companyId);
        const now = dayjs().tz('Asia/Ho_Chi_Minh');
        const refreshTokenExpiresAt = now.add(7, 'day');

        await this.prisma.session.create({
            data: {
                user_id: user.user_id,
                token: refreshToken,
                created_at: now.toDate(),
                expires_at: refreshTokenExpiresAt.toDate(),
                is_active: true,
                last_used_at: now.toDate(),
            },
        });

        const permissions = await this.getUserPermissions(user.role_id);

        // CHANGED: Trả về tokens và thông tin user trong một object
        return {
            user: {
                user_id: user.user_id,
                email: user.email,
                role_name: user.roles.name,
                company_id: user.company_id,
                company_name: user.transport_company ? user.transport_company.name : null,
                permissions
            },
            accessToken,
            refreshToken
        };
    }

    async refreshToken(refreshToken: string) {
        const session = await this.prisma.session.findFirst({
            where: { token: refreshToken, is_active: true },
        });

        if (!session || dayjs(session.expires_at).isBefore(dayjs())) {
            if (session) {
                await this.prisma.session.update({ where: { id: session.id }, data: { is_active: false } });
            }
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn.');
        }

        try {
            const payload: { user_id: number; role_id: number; company_id?: number; } = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            });

            const newAccessToken = this.generateAccessToken(payload.user_id, payload.role_id, payload.company_id);

            await this.prisma.session.update({
                where: { id: session.id },
                data: { last_used_at: dayjs().toDate() },
            });

            // CHANGED: Trả về access token mới
            return {
                accessToken: newAccessToken
            };
        } catch (error) {
            throw new UnauthorizedException('Refresh token không hợp lệ.');
        }
    }

    async logout(user_id: number) {
        await this.prisma.session.updateMany({
            where: { user_id, is_active: true },
            data: { is_active: false },
        });
        return { message: 'Đăng xuất thành công.' };
    }

    async getUserPermissions(role_id: number) {
        const rolePermissions = await this.prisma.role_module_permissions.findMany({
            where: { role_id },
            include: { modules: true },
        });

        const result: { module_name: string; module_code: string; permissions: string[] }[] = [];

        for (const rmp of rolePermissions) {
            const allowedPermissions = await this.getPermissionsFromBitmask(
                rmp.permissions_bitmask,
                rmp.module_id
            );
            result.push({
                module_name: rmp.modules.name,
                module_code: rmp.modules.code,
                permissions: allowedPermissions,
            });
        }
        return result;
    }

    private async getPermissionsFromBitmask(bitmask: number, module_id: number) {
        const permissions = await this.prisma.permissions.findMany({
            where: { module_id },
        });

        return permissions
            .filter(p => (bitmask & p.bit_value) === p.bit_value)
            .map(p => p.name);
    }

    async validateToken(user_id: number, request: Request) {
        const cookies = request.cookies || {};
        const accessToken = cookies['access_token'];

        if (!accessToken) {
            throw new UnauthorizedException('Không có access token được cung cấp.');
        }

        // Trong validateToken, bạn cần xác minh access token bằng jwtService.verifyAsync
        // và kiểm tra session. Hiện tại bạn đang tìm session bằng access token, điều này
        // không đúng nếu session lưu refresh token.
        // Logic đúng là: verify access token, sau đó kiểm tra sự tồn tại và tính hợp lệ của refresh token trong session.
        try {
            const payload: { user_id: number; role_id: number; company_id?: number; } = await this.jwtService.verifyAsync(accessToken, {
                secret: process.env.JWT_ACCESS_SECRET
            });

            // Nếu access token hợp lệ, kiểm tra xem có refresh token tương ứng trong session không
            const refreshTokenFromCookie = cookies['refresh_token'];
            if (!refreshTokenFromCookie) {
                throw new UnauthorizedException('Không có refresh token được cung cấp.');
            }

            const session = await this.prisma.session.findFirst({
                where: { user_id: payload.user_id, token: refreshTokenFromCookie, is_active: true },
            });

            if (!session || dayjs(session.expires_at).tz('Asia/Ho_Chi_Minh').isBefore(dayjs().tz('Asia/Ho_Chi_Minh'))) {
                // Đánh dấu session là không hoạt động nếu hết hạn
                if (session) {
                    await this.prisma.session.update({
                        where: { id: session.id },
                        data: { is_active: false },
                    });
                }
                throw new UnauthorizedException('Phiên không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
            }

            // Cập nhật thời gian sử dụng cuối cùng của session (refresh token)
            await this.prisma.session.update({
                where: { id: session.id },
                data: {
                    last_used_at: dayjs().tz('Asia/Ho_Chi_Minh').toDate()
                },
            });

            return true;
        } catch (error) {
            console.error("Lỗi xác thực token:", error);
            throw new UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn.');
        }
    }

    private generateAccessToken(user_id: number, role_id: number, company_id?: number | null) {
        const payload: { user_id: number; role_id: number; company_id?: number } = { user_id, role_id };
        if (company_id !== undefined && company_id !== null) {
            payload.company_id = company_id;
        }

        return this.jwtService.sign(
            payload,
            // CHANGED: Thời gian sống của access token giảm còn 10 phút
            { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '10m' }
        );
    }

    private generateRefreshToken(user_id: number, role_id: number, company_id?: number | null) {
        const payload: { user_id: number; role_id: number; company_id?: number } = { user_id, role_id };
        // Chỉ thêm company_id nếu nó khác null và undefined
        if (company_id !== undefined && company_id !== null) {
            payload.company_id = company_id;
        }

        return this.jwtService.sign(
            payload,
            { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' }
        );
    }

    async getCurrentUser(user_id: number) {
        const user = await this.prisma.users.findUnique({
            where: { user_id: user_id },
            include: {
                roles: true,
                transport_company: true, // THÊM include này để lấy thông tin công ty
            },
        });

        if (!user) throw new UnauthorizedException('Người dùng không tồn tại.');

        const permissions = await this.getUserPermissions(user.role_id);
        return {
            user_id: user.user_id,
            email: user.email,
            role_name: user.roles.name,
            company_id: user.company_id,
            company_name: user.transport_company?.name || null, // Đảm bảo trả về null nếu không có công ty
            permissions
        };
    }
}