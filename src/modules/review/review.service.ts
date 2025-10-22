import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }
    async create(tripId: number, customerId: number, createReviewDto: CreateReviewDto) {
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
        if (new Date(trip.departure_time) > new Date()) {
            throw new ForbiddenException('You can only review trips that have been completed.');
        }

        // 4. Kiểm tra xem khách hàng đã đánh giá chuyến này chưa
        const existingReview = await this.prisma.reviews.findUnique({
            where: {
                trip_id_customer_id: { // Prisma tự động tạo tên này từ @@unique
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
}
