// src/auth-user/auth-user.controller.ts
import { Controller, Post, UseGuards, Request, Body, Get, Res, HttpCode, HttpStatus, Patch, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthUserService } from './auth-user.service';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { UpdateUserDto } from './dto/update-user.dto';

const getCookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    path: '/',
    maxAge,
});

@Controller('auth-user')
export class AuthUserController {
    constructor(private authUserService: AuthUserService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authUserService.register(registerDto);
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req, @Res({ passthrough: true }) res: Response) {
        const tokens = await this.authUserService.login(req.user);
        res.cookie('access_token', tokens.access_token, getCookieOptions(15 * 60 * 1000));
        res.cookie('refresh_token', tokens.refresh_token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        const { password_hash, refresh_token_hash, ...userResult } = req.user;
        return userResult;
    }

    @UseGuards(AuthGuard('jwt-cus'))
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
        await this.authUserService.logout(req.user.customer_id);
        res.clearCookie('access_token', { path: '/' });
        res.clearCookie('refresh_token', { path: '/' });
        return { message: 'Đăng xuất thành công' };
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshTokens(@Request() req, @Res({ passthrough: true }) res: Response) {
        const { sub, refreshToken } = req.user;
        const tokens = await this.authUserService.refreshToken(sub, refreshToken);
        res.cookie('access_token', tokens.access_token, getCookieOptions(15 * 60 * 1000));
        res.cookie('refresh_token', tokens.refresh_token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        return { message: "Token refreshed successfully" };
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() { }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleAuthRedirect(@Request() req, @Res() res: Response) {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
        }
        const tokens = await this.authUserService.login(req.user);
        res.cookie('access_token', tokens.access_token, getCookieOptions(15 * 60 * 1000));
        res.cookie('refresh_token', tokens.refresh_token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        return res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
    }

    @Get('profile')
    @UseGuards(AuthGuard('jwt-cus'))
    getProfile(@Request() req) {
        return this.authUserService.getProfile(req.user.customer_id);
    }

    @Patch('profile')
    @UseGuards(AuthGuard('jwt-cus'))
    @HttpCode(HttpStatus.OK)
    async updateProfile(
        @Request() req,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const userId = req.user.customer_id;
        return this.authUserService.updateUser(userId, updateUserDto);
    }

    @Get('tickets')
    @UseGuards(AuthGuard('jwt-cus'))
    getTicketOfUser(@Request() req) {
        return this.authUserService.getTicketsOfUser(req.user.customer_id)
    }

    @Get('ticket/:code')
    @UseGuards(AuthGuard('jwt-cus'))
    getTicketByCode(@Request() req, @Param('code') code: string) {
        const userId = req.user.customer_id;
        return this.authUserService.getTicketByCode(userId, code);
    }

}