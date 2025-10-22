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
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller() // Thay đổi thành @Controller() để hỗ trợ nhiều tiền tố
export class ReviewController {
    constructor(private readonly reviewsService: ReviewService) { }

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

    // MỚI: API Lấy review của user cho 1 chuyến đi
    @Get('trips/:tripId/my-review')
    @UseGuards(AuthGuard('jwt-cus'))
    getMyReview(
        @Request() req,
        @Param('tripId', ParseIntPipe) tripId: number,
    ) {
        const customerId = req.user.customer_id;
        return this.reviewsService.findMyReviewForTrip(tripId, customerId);
    }

    // MỚI: API Cập nhật review
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

    // MỚI: API Lấy review bằng ID (như bạn yêu cầu)
    @Get('reviews/:reviewId')
    @UseGuards(AuthGuard('jwt-cus')) // Giả sử review là riêng tư
    getReviewById(@Param('reviewId', ParseIntPipe) reviewId: number) {
        return this.reviewsService.findOne(reviewId);
    }
}