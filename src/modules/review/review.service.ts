// src/review/review.service.ts
import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateReviewDto } from './dto/update-review.dto'; // Import DTO mới

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }
    async create(
        tripId: number,
        customerId: number,
        createReviewDto: CreateReviewDto,
    ) {
        const { rating, comment } = createReviewDto;

        // 1. Kiểm tra xem chuyến đi có tồn tại không
        const trip = await this.prisma.trips.findUnique({
            where: { id: tripId },
        });
        if (!trip) {
            throw new NotFoundException(`Trip with ID ${tripId} not found`);
        }

        // 2. [QUAN TRỌNG] Xác thực khách hàng có vé cho chuyến đi này
        const ticket = await this.prisma.tickets.findFirst({
            where: {
                trip_id: tripId,
                customer_id: customerId,
                // Bạn có thể thêm điều kiện status của vé nếu cần, ví dụ: 'COMPLETED'
            },
        });
        if (!ticket) {
            throw new ForbiddenException('You are not authorized to review this trip.');
        }

        // 3. Kiểm tra xem chuyến đi đã hoàn thành chưa
        // Bỏ qua điều kiện này, vì frontend đã check 'isUpcoming'
        // if (new Date(trip.departure_time) > new Date()) {
        //   throw new ForbiddenException('You can only review trips that have been completed.');
        // }

        // 4. Kiểm tra xem khách hàng đã đánh giá chuyến này chưa
        const existingReview = await this.prisma.reviews.findUnique({
            where: {
                trip_id_customer_id: {
                    // Prisma tự động tạo tên này từ @@unique
                    trip_id: tripId,
                    customer_id: customerId,
                },
            },
        });
        if (existingReview) {
            throw new ConflictException('You have already reviewed this trip.');
        }

        // 5. Tạo review mới
        return this.prisma.reviews.create({
            data: {
                rating,
                comment,
                trip_id: tripId,
                customer_id: customerId,
            },
        });
    }

    // MỚI: Logic cập nhật
    async update(
        reviewId: number,
        customerId: number,
        updateReviewDto: UpdateReviewDto,
    ) {
        // 1. Tìm review
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new NotFoundException('Review not found');
        }

        // 2. Xác thực chủ sở hữu
        if (review.customer_id !== customerId) {
            throw new ForbiddenException('You are not authorized to update this review');
        }

        // 3. Cập nhật review
        return this.prisma.reviews.update({
            where: { id: reviewId },
            data: updateReviewDto,
        });
    }

    // MỚI: Logic tìm review của tôi cho 1 chuyến đi
    async findMyReviewForTrip(tripId: number, customerId: number) {
        // Sẽ trả về review hoặc null
        return this.prisma.reviews.findUnique({
            where: {
                trip_id_customer_id: {
                    trip_id: tripId,
                    customer_id: customerId,
                },
            },
        });
    }

    // MỚI: Logic tìm 1 review bằng ID
    async findOne(reviewId: number) {
        const review = await this.prisma.reviews.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        return review;
    }
}