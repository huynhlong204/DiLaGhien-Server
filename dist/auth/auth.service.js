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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const timezone = require("dayjs/plugin/timezone");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async adminLogin(loginDto, res) {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
            include: { roles: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Email không tồn tại.');
        if (!user.roles || user.roles.name !== 'admin' || user.company_id !== null)
            throw new common_1.ForbiddenException('Chỉ admin được phép đăng nhập và không được liên kết với công ty.');
        if (!user.password_hash)
            throw new common_1.UnauthorizedException('Dữ liệu user không hợp lệ.');
        const isValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isValid)
            throw new common_1.UnauthorizedException('Mật khẩu không đúng.');
        return this.createSessionAndSetCookies(user, res);
    }
    async companyLogin(loginDto, res) {
        const user = await this.prisma.users.findUnique({
            where: { email: loginDto.email },
            include: { roles: true, transport_company: true },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Email không tồn tại.');
        if (!user.roles || user.roles.name !== 'owner' || !user.company_id)
            throw new common_1.ForbiddenException('Chỉ chủ nhà xe được phép đăng nhập và phải liên kết với một công ty.');
        if (!user.password_hash)
            throw new common_1.UnauthorizedException('Dữ liệu user không hợp lệ.');
        const isValid = await bcrypt.compare(loginDto.password, user.password_hash);
        if (!isValid)
            throw new common_1.UnauthorizedException('Mật khẩu không đúng.');
        return this.createSessionAndSetCookies(user, res);
    }
    async createSessionAndSetCookies(user, res) {
        const companyId = user.company_id;
        const accessToken = this.generateAccessToken(user.user_id, user.role_id, companyId);
        const refreshToken = this.generateRefreshToken(user.user_id, user.role_id, companyId);
        const now = dayjs().tz('Asia/Ho_Chi_Minh');
        const accessTokenExpiresAt = now.add(1, 'hour');
        const refreshTokenExpiresAt = now.add(7, 'day');
        const session = await this.prisma.session.create({
            data: {
                user_id: user.user_id,
                token: refreshToken,
                created_at: now.toDate(),
                expires_at: refreshTokenExpiresAt.toDate(),
                is_active: true,
                last_used_at: now.toDate(),
            },
        });
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 1 * 60 * 60 * 1000,
            path: '/',
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
        const permissions = await this.getUserPermissions(user.role_id);
        return {
            user_id: user.user_id,
            email: user.email,
            role_name: user.roles.name,
            company_id: user.company_id,
            company_name: user.transport_company ? user.transport_company.name : null,
            permissions
        };
    }
    async refreshToken(refreshToken, res) {
        const session = await this.prisma.session.findFirst({
            where: { token: refreshToken, is_active: true },
        });
        if (!session || dayjs(session.expires_at).tz('Asia/Ho_Chi_Minh').isBefore(dayjs().tz('Asia/Ho_Chi_Minh'))) {
            if (session) {
                await this.prisma.session.update({
                    where: { id: session.id },
                    data: { is_active: false },
                });
            }
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        }
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            });
            const now = dayjs().tz('Asia/Ho_Chi_Minh');
            const newAccessToken = this.generateAccessToken(payload.user_id, payload.role_id, payload.company_id);
            const accessTokenExpiresAt = now.add(1, 'hour');
            await this.prisma.session.update({
                where: { id: session.id },
                data: {
                    last_used_at: now.toDate(),
                },
            });
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 60 * 60 * 1000,
                path: '/',
            });
            return {
                message: 'Access token đã được làm mới.',
                access_token: newAccessToken
            };
        }
        catch (error) {
            console.error("Lỗi làm mới token:", error);
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ. Vui lòng đăng nhập lại.');
        }
    }
    async logout(user_id, access_token, res) {
        await this.prisma.session.updateMany({
            where: { user_id, is_active: true },
            data: { is_active: false },
        });
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return { message: 'Đăng xuất thành công.' };
    }
    async getUserPermissions(role_id) {
        const rolePermissions = await this.prisma.role_module_permissions.findMany({
            where: { role_id },
            include: { modules: true },
        });
        const result = [];
        for (const rmp of rolePermissions) {
            const allowedPermissions = await this.getPermissionsFromBitmask(rmp.permissions_bitmask, rmp.module_id);
            result.push({
                module_name: rmp.modules.name,
                module_code: rmp.modules.code,
                permissions: allowedPermissions,
            });
        }
        return result;
    }
    async getPermissionsFromBitmask(bitmask, module_id) {
        const permissions = await this.prisma.permissions.findMany({
            where: { module_id },
        });
        return permissions
            .filter(p => (bitmask & p.bit_value) === p.bit_value)
            .map(p => p.name);
    }
    async validateToken(user_id, request) {
        const cookies = request.cookies || {};
        const accessToken = cookies['access_token'];
        if (!accessToken) {
            throw new common_1.UnauthorizedException('Không có access token được cung cấp.');
        }
        try {
            const payload = await this.jwtService.verifyAsync(accessToken, {
                secret: process.env.JWT_ACCESS_SECRET
            });
            const refreshTokenFromCookie = cookies['refresh_token'];
            if (!refreshTokenFromCookie) {
                throw new common_1.UnauthorizedException('Không có refresh token được cung cấp.');
            }
            const session = await this.prisma.session.findFirst({
                where: { user_id: payload.user_id, token: refreshTokenFromCookie, is_active: true },
            });
            if (!session || dayjs(session.expires_at).tz('Asia/Ho_Chi_Minh').isBefore(dayjs().tz('Asia/Ho_Chi_Minh'))) {
                if (session) {
                    await this.prisma.session.update({
                        where: { id: session.id },
                        data: { is_active: false },
                    });
                }
                throw new common_1.UnauthorizedException('Phiên không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
            }
            await this.prisma.session.update({
                where: { id: session.id },
                data: {
                    last_used_at: dayjs().tz('Asia/Ho_Chi_Minh').toDate()
                },
            });
            return true;
        }
        catch (error) {
            console.error("Lỗi xác thực token:", error);
            throw new common_1.UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn.');
        }
    }
    generateAccessToken(user_id, role_id, company_id) {
        const payload = { user_id, role_id };
        if (company_id !== undefined && company_id !== null) {
            payload.company_id = company_id;
        }
        return this.jwtService.sign(payload, { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h' });
    }
    generateRefreshToken(user_id, role_id, company_id) {
        const payload = { user_id, role_id };
        if (company_id !== undefined && company_id !== null) {
            payload.company_id = company_id;
        }
        return this.jwtService.sign(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' });
    }
    async getCurrentUser(user_id) {
        const user = await this.prisma.users.findUnique({
            where: { user_id: user_id },
            include: {
                roles: true,
                transport_company: true,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Người dùng không tồn tại.');
        const permissions = await this.getUserPermissions(user.role_id);
        return {
            user_id: user.user_id,
            email: user.email,
            role_name: user.roles.name,
            company_id: user.company_id,
            company_name: user.transport_company?.name || null,
            permissions
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map