// src/review/review.controller.ts
import {
    Controller,
    Post,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    Request,
    Get,
    Patch,
    Query, // Import Query để phân trang
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller() // Sử dụng @Controller() trống để hỗ trợ nhiều tiền tố
export class ReviewController {
    constructor(private readonly reviewsService: ReviewService) { }

    /**
     * @description Tạo review mới cho một chuyến đi (trip)
     * @route POST /trips/:tripId/reviews
     * @access Private (Customer)
     */
    @Post('trips/:tripId/reviews')
    @UseGuards(AuthGuard('jwt-cus'))
    create(
        @Request() req,
        @Param('tripId', ParseIntPipe) tripId: number,
        @Body() createReviewDto: CreateReviewDto,
    ) {
        const customerId = req.user.customer_id;
        return this.reviewsService.create(tripId, customerId, createReviewDto);
    }

    /**
     * @description Lấy review của chính user đó cho một chuyến đi cụ thể
     * @route GET /trips/:tripId/my-review
     * @access Private (Customer)
     */
    @Get('trips/:tripId/my-review')
    @UseGuards(AuthGuard('jwt-cus'))
    getMyReview(
        @Request() req,
        @Param('tripId', ParseIntPipe) tripId: number,
    ) {
        const customerId = req.user.customer_id;
        return this.reviewsService.findMyReviewForTrip(tripId, customerId);
    }

    /**
     * @description Cập nhật một review đã tồn tại
     * @route PATCH /reviews/:reviewId
     * @access Private (Customer - Chủ sở hữu review)
     */
    @Patch('reviews/:reviewId')
    @UseGuards(AuthGuard('jwt-cus'))
    update(
        @Request() req,
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Body() updateReviewDto: UpdateReviewDto,
    ) {
        const customerId = req.user.customer_id;
        return this.reviewsService.update(reviewId, customerId, updateReviewDto);
    }

    /**
     * @description Lấy chi tiết một review bằng ID
     * @route GET /reviews/:reviewId
     * @access Private (Customer)
     */
    @Get('reviews/:reviewId')
    @UseGuards(AuthGuard('jwt-cus')) // Giả sử review là riêng tư
    getReviewById(@Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.reviewsService.findOne(reviewId);
    }

    /**
     * @description Lấy danh sách review theo nhà xe (có phân trang)
     * @route GET /transport-companies/:companyId/reviews
     * @access Public
     */
    @Get('transport-companies/:companyId/reviews')
    findAllByCompany(
        @Param('companyId', ParseIntPipe) companyId: number,
        @Query('page', new ParseIntPipe({ optional: true })) page: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit: number,
    ) {
        // Đặt giá trị mặc định nếu không cung cấp
        const safePage = page || 1;
        const safeLimit = limit || 10;
        return this.reviewsService.findAllByCompany(companyId, {
            page: safePage,
            limit: safeLimit,
        });
    }

    /**
     * @description Lấy thống kê review theo nhà xe (tổng số, trung bình)
     * @route GET /transport-companies/:companyId/reviews/summary
     * @access Public
     */
    @Get('transport-companies/:companyId/reviews/summary')
    getReviewSummaryByCompany(
        @Param('companyId', ParseIntPipe) companyId: number,
    ) {
        return this.reviewsService.getReviewSummaryByCompany(companyId);
    }
}