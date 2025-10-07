// src/auth/auth.controller.ts

import { Controller, Post, Body, Req, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto'; // Import DTO mới

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('admin/login')
    async adminLogin(@Body() loginDto: LoginDto) {
        // REMOVED: res object
        return this.authService.adminLogin(loginDto);
    }

    @Post('company/login')
    async companyLogin(@Body() loginDto: LoginDto) {
        // REMOVED: res object
        return this.authService.companyLogin(loginDto);
    }

    @Post('refresh')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        // CHANGED: Lấy refresh token từ body
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request) {
        // REMOVED: res object
        const user_id = (req as any).user['user_id'];
        return this.authService.logout(user_id);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req: Request) {
        // REMOVED: res object
        const user_id = (req as any).user['user_id'];
        return this.authService.getCurrentUser(user_id);
    }
}