// src/interactions/interactions.service.ts
import { Injectable } from '@nestjs/common';
import { LogInteractionDto } from './dto/log-interaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InteractionsService {
  constructor(private prisma: PrismaService) {}

  async logInteraction(
    dto: LogInteractionDto,
    customerId: number | null, // Sẽ được truyền từ controller
  ) {
    const { session_id, event_type, event_data } = dto;

    // Chỉ cần tạo, không cần đợi (fire-and-forget)
    // để trả về response cho client ngay lập tức
    this.prisma.user_interactions.create({
      data: {
        customer_id: customerId, // Sẽ là null nếu là khách vãng lai
        session_id,
        event_type,
        event_data, // Prisma sẽ tự động xử lý object thành kiểu Json
      },
    }).catch(err => {
      // Ghi log lỗi nội bộ, nhưng không re-throw để làm sập request
      console.error('Failed to log interaction:', err);
    });

    // Trả về ngay lập tức
    return { success: true };
  }
}