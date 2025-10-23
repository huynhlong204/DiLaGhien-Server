import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Request, UseGuards, ValidationPipe } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { FindPromotionsQueryDto } from './dto/find-promotions-query.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { FindApplicablePromotionsQueryDto } from './dto/find-applicable-promotions-query.dto';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    // ============ CLIENT API ============

    /**
     * @description API để xác thực mã khuyến mãi cho một nhà xe.
     * @route GET /promotions/validate?code=XYZ&companyId=123
     */
    @Get('validate')
    async validateCode(
        @Query('code') code: string,
        @Query('companyId', ParseIntPipe) companyId: number
    ) {
        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            throw new BadRequestException('Mã khuyến mãi không được để trống.');
        }
        return this.promotionService.validatePromotion(code.trim(), companyId);
    }

    /**
     * MỚI: API lấy danh sách mã khuyến mãi có thể áp dụng cho nhà xe
     * @route GET /promotions/applicable?companyId=123
     */
    @Get('applicable')
    findApplicablePromotions(
        @Query(new ValidationPipe({ transform: true, whitelist: true })) query: FindApplicablePromotionsQueryDto,
    ) {
        return this.promotionService.findApplicable(query);
    }

    /**
     * MỚI: API lấy danh sách khuyến mãi công khai
     * @route GET /promotions/public?limit=3
     */
    @Get('public')
    findPublicPromotions(
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        // Đặt giới hạn mặc định nếu không truyền
        const safeLimit = limit && limit > 0 ? limit : 5;
        return this.promotionService.findPublic(safeLimit);
    }
    // ============ ADMIN / COMPANY APIs (Protected) ============

    /**
     * @description Tạo khuyến mãi mới (Admin: global, Company: cho chính mình)
     * @route POST /promotions
     */
    @UseGuards(JwtAuthGuard) // Bảo vệ endpoint
    @Post()
    create(
        @Body(ValidationPipe) createPromotionDto: CreatePromotionDto,
        @Request() req
    ) {
        const user: AuthenticatedUser = req.user;
        return this.promotionService.create(createPromotionDto, user);
    }

    /**
     * @description Lấy danh sách khuyến mãi (Admin: all, Company: của mình)
     * @route GET /promotions
     */
    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(
        @Query(ValidationPipe) query: FindPromotionsQueryDto,
        @Request() req
    ) {
        const user: AuthenticatedUser = req.user;
        return this.promotionService.findAll(query, user);
    }

    /**
     * @description Lấy chi tiết một khuyến mãi
     * @route GET /promotions/:id
     */
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const user: AuthenticatedUser = req.user;
        return this.promotionService.findOne(id, user);
    }

    /**
     * @description Cập nhật một khuyến mãi
     * @route PATCH /promotions/:id
     */
    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body(ValidationPipe) updatePromotionDto: UpdatePromotionDto,
        @Request() req
    ) {
        const user: AuthenticatedUser = req.user;
        return this.promotionService.update(id, updatePromotionDto, user);
    }

    /**
     * @description Xóa một khuyến mãi
     * @route DELETE /promotions/:id
     */
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const user: AuthenticatedUser = req.user;
        return this.promotionService.remove(id, user);
    }
}
