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

    async adminLogin(loginDto: LoginDto, res: Response) {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
            include: { roles: true },
        });

        if (!user) throw new UnauthorizedException('Email không tồn tại.');
        // Đảm bảo chỉ admin mới có vai trò 'admin' và không có company_id
        if (!user.roles || user.roles.name !== 'admin' || user.company_id !== null) throw new ForbiddenException('Chỉ admin được phép đăng nhập và không được liên kết với công ty.');
        if (!user.password_hash) throw new UnauthorizedException('Dữ liệu user không hợp lệ.');

        const isValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isValid) throw new UnauthorizedException('Mật khẩu không đúng.');

        // Admin user sẽ có company_id là null hoặc undefined, sẽ được xử lý trong createSessionAndSetCookies
        return this.createSessionAndSetCookies(user, res);
    }

    async companyLogin(loginDto: LoginDto, res: Response) {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
            include: { roles: true, transport_company: true }, // THÊM include transport_company để lấy company_id và name
        });

        if (!user) throw new UnauthorizedException('Email không tồn tại.');
        // Kiểm tra đúng vai trò (owner) và phải có company_id
        if (!user.roles || user.roles.name !== 'owner' || !user.company_id)
            throw new ForbiddenException('Chỉ chủ nhà xe được phép đăng nhập và phải liên kết với một công ty.');
        if (!user.password_hash) throw new UnauthorizedException('Dữ liệu user không hợp lệ.');

        const isValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isValid) throw new UnauthorizedException('Mật khẩu không đúng.');

        return this.createSessionAndSetCookies(user, res);
    }

    private _setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {

        const isProd = process.env.NODE_ENV === 'production';

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProd, // phải true nếu dùng https (vercel có)
            sameSite: 'none', // để share cookie cross-origin
            maxAge: 1 * 60 * 60 * 1000,
            domain: isProd ? '.dilaghien.vercel.app' : 'localhost',
            path: '/',
        });

        if (refreshToken) {
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: 'none',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                domain: isProd ? '.vercel.app' : 'localhost',
                path: '/',
            });
        }
    }

    private async createSessionAndSetCookies(user: any, res: Response) {
        // companyId sẽ là null nếu user không có company_id (ví dụ: Admin)
        const companyId = user.company_id;

        // Truyền companyId vào hàm generateAccessToken và generateRefreshToken
        const accessToken = this.generateAccessToken(user.user_id, user.role_id, companyId);
        const refreshToken = this.generateRefreshToken(user.user_id, user.role_id, companyId);
        const now = dayjs().tz('Asia/Ho_Chi_Minh');

        const accessTokenExpiresAt = now.add(1, 'hour');
        const refreshTokenExpiresAt = now.add(7, 'day');

        // Lưu refresh token vào session để quản lý phiên, không phải access token
        // Access token sẽ được sử dụng trong cookie để xác thực request
        const session = await this.prisma.session.create({
            data: {
                user_id: user.user_id,
                token: refreshToken, // <<< Sửa: Lưu refresh token vào session
                created_at: now.toDate(),
                expires_at: refreshTokenExpiresAt.toDate(), // Thời gian hết hạn của session theo refresh token
                is_active: true,
                last_used_at: now.toDate(),
            },
        });

        this._setAuthCookies(res, accessToken, refreshToken);

        const permissions = await this.getUserPermissions(user.role_id);

        return {
            user_id: user.user_id,
            email: user.email,
            role_name: user.roles.name,
            company_id: user.company_id,
            company_name: user.transport_company ? user.transport_company.name : null, // Thêm tên công ty nếu có
            permissions
        };
    }

    async refreshToken(refreshToken: string, res: Response) {
        // Tìm session dựa trên refresh token
        const session = await this.prisma.session.findFirst({
            where: { token: refreshToken, is_active: true },
        });

        if (!session || dayjs(session.expires_at).tz('Asia/Ho_Chi_Minh').isBefore(dayjs().tz('Asia/Ho_Chi_Minh'))) {
            // Đánh dấu session là không hoạt động nếu hết hạn hoặc không tìm thấy
            if (session) {
                await this.prisma.session.update({
                    where: { id: session.id },
                    data: { is_active: false },
                });
            }
            throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        }

        try {
            const payload: { user_id: number; role_id: number; company_id?: number; } = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            });

            const now = dayjs().tz('Asia/Ho_Chi_Minh');
            // Tạo access token mới với company_id từ refresh token payload
            const newAccessToken = this.generateAccessToken(payload.user_id, payload.role_id, payload.company_id);
            const accessTokenExpiresAt = now.add(1, 'hour'); // Access token có thể có thời gian sống dài hơn nếu muốn

            // Cập nhật session `last_used_at` để kéo dài thời gian sống của refresh token (nếu bạn muốn)
            await this.prisma.session.update({
                where: { id: session.id },
                data: {
                    last_used_at: now.toDate(),
                    // Không cập nhật `token` và `expires_at` của session ở đây,
                    // vì session `token` là refresh token, không phải access token.
                    // Nếu bạn muốn refresh token cũng tự động gia hạn, bạn cần tạo refresh token mới
                    // và cập nhật session. Hoặc giữ nguyên logic này nếu refresh token cố định 7 ngày.
                },
            });

            this._setAuthCookies(res, newAccessToken);

            return {
                message: 'Access token đã được làm mới.',
                access_token: newAccessToken // Có thể không cần trả về này nếu chỉ dùng cookie
            };
        } catch (error) {
            console.error("Lỗi làm mới token:", error);
            throw new UnauthorizedException('Refresh token không hợp lệ. Vui lòng đăng nhập lại.');
        }
    }

    async logout(user_id: number, access_token: string, res: Response) {
        // Tìm và vô hiệu hóa tất cả các session của user đó, hoặc chỉ session tương ứng với refresh token nếu bạn muốn logout riêng lẻ từng phiên
        // Để đơn giản, ta sẽ vô hiệu hóa tất cả các session đang active của user.
        await this.prisma.session.updateMany({
            where: { user_id, is_active: true }, // Vô hiệu hóa tất cả các phiên đang hoạt động của user
            data: { is_active: false },
        });

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

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
        // Chỉ thêm company_id nếu nó khác null và undefined
        if (company_id !== undefined && company_id !== null) {
            payload.company_id = company_id;
        }

        return this.jwtService.sign(
            payload,
            { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' }
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