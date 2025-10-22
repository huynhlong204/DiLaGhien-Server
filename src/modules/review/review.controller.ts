import { Controller, Post, Body, Param, UseGuards, ParseIntPipe, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('trips')
export class ReviewController {
    constructor(private readonly reviewsService: ReviewService) { }


    @Post(':tripId/reviews')
    @UseGuards(AuthGuard('jwt-cus'))
    create(
        @Request() req,
        @Param('tripId', ParseIntPipe) tripId: number,
        @Body() createReviewDto: CreateReviewDto,
    ) {
        const customerId = req.user.customer_id;
        return this.reviewsService.create(tripId, customerId, createReviewDto);
    }
}