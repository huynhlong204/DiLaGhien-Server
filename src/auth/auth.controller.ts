import { Controller, Post, Body, Res, Req, UseGuards, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Controller xử lý các route liên quan đến authentication
 */
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    /**
     * Route xử lý đăng nhập cho admin
     * @param loginDto Object chứa thông tin đăng nhập (email, password)
     * @param res Response object để set cookie
     * @returns Thông tin user đã đăng nhập
     */
    @Post('admin/login')
    async adminLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.adminLogin(loginDto, res);
        res.status(200).json(result);
    }

    /**
     * Route xử lý đăng nhập cho chủ nhà xe
     * @param loginDto Object chứa thông tin đăng nhập (email, password)
     * @param res Response object để set cookie
     * @returns Thông tin user đã đăng nhập
     */
    @Post('company/login')
    async companyLogin(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.companyLogin(loginDto, res);
        res.status(200).json(result);
    }

    /**
     * Route làm mới access token bằng refresh token
     * @param req Request object chứa refresh token trong cookies
     * @param res Response object để set cookie mới
     * @returns Access token mới
     * @throws UnauthorizedException nếu không tìm thấy refresh token
     */
    @Post('refresh')
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) throw new UnauthorizedException('Refresh token không tồn tại.');
        const result = await this.authService.refreshToken(refreshToken, res);
        res.status(200).json(result);
    }

    /**
     * Route xử lý đăng xuất user
     * @param req Request object chứa thông tin user từ JWT
     * @param res Response object để xóa cookies
     * @returns Message thông báo đăng xuất thành công
     */
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user_id = (req as any).user['user_id'];
        // Bạn không cần truyền access_token nữa vì logic logout sẽ vô hiệu hóa tất cả session của user_id
        // Nếu muốn logout theo phiên cụ thể, bạn cần truyền refresh_token thay vì access_token
        const result = await this.authService.logout(user_id, req.cookies['access_token'], res); // Truyền access_token hiện tại (hoặc refresh_token nếu bạn muốn logout session cụ thể)
        res.status(200).json(result);
    }

    /**
     * Route lấy thông tin user hiện tại
     * @param req Request object chứa thông tin user từ JWT
     * @param res Response object
     * @returns Thông tin chi tiết của user đang đăng nhập
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Req() req: Request, @Res() res: Response) {
        const user_id = (req as any).user['user_id'];
        const user = await this.authService.getCurrentUser(user_id);
        res.status(200).json(user);
    }
}