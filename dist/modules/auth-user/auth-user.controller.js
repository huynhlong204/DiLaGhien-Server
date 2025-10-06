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
exports.AuthUserController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_user_service_1 = require("./auth-user.service");
const register_dto_1 = require("./dto/register.dto");
const google_auth_guard_1 = require("./guards/google-auth.guard");
const refresh_token_guard_1 = require("./guards/refresh-token.guard");
const update_user_dto_1 = require("./dto/update-user.dto");
const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge,
});
let AuthUserController = class AuthUserController {
    authUserService;
    constructor(authUserService) {
        this.authUserService = authUserService;
    }
    async register(registerDto) {
        return this.authUserService.register(registerDto);
    }
    async login(req, res) {
        const tokens = await this.authUserService.login(req.user);
        res.cookie('access_token', tokens.access_token, getCookieOptions(15 * 60 * 1000));
        res.cookie('refresh_token', tokens.refresh_token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        const { password_hash, refresh_token_hash, ...userResult } = req.user;
        return userResult;
    }
    async logout(req, res) {
        await this.authUserService.logout(req.user.customer_id);
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        return { message: 'Đăng xuất thành công' };
    }
    async refreshTokens(req, res) {
        const { sub, refreshToken } = req.user;
        const tokens = await this.authUserService.refreshToken(sub, refreshToken);
        res.cookie('access_token', tokens.access_token, getCookieOptions(15 * 60 * 1000));
        res.cookie('refresh_token', tokens.refresh_token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        return { message: "Token refreshed successfully" };
    }
    async googleAuth() { }
    async googleAuthRedirect(req, res) {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
        const tokens = await this.authUserService.login(req.user);
        res.cookie('access_token', tokens.access_token, getCookieOptions(15 * 60 * 1000));
        res.cookie('refresh_token', tokens.refresh_token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    }
    getProfile(req) {
        return this.authUserService.getProfile(req.user.customer_id);
    }
    async updateProfile(req, updateUserDto) {
        const userId = req.user.customer_id;
        return this.authUserService.updateUser(userId, updateUserDto);
    }
    getTicketOfUser(req) {
        return this.authUserService.getTicketsOfUser(req.user.customer_id);
    }
    getTicketByCode(req, code) {
        const userId = req.user.customer_id;
        return this.authUserService.getTicketByCode(userId, code);
    }
};
exports.AuthUserController = AuthUserController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('local')),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-cus')),
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "refreshTokens", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-cus')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthUserController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-cus')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], AuthUserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('tickets'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-cus')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthUserController.prototype, "getTicketOfUser", null);
__decorate([
    (0, common_1.Get)('ticket/:code'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt-cus')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthUserController.prototype, "getTicketByCode", null);
exports.AuthUserController = AuthUserController = __decorate([
    (0, common_1.Controller)('auth-user'),
    __metadata("design:paramtypes", [auth_user_service_1.AuthUserService])
], AuthUserController);
//# sourceMappingURL=auth-user.controller.js.map