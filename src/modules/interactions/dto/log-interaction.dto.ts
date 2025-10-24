// src/interactions/dto/log-interaction.dto.ts
import { IsNotEmpty, IsString, IsObject, IsJSON } from 'class-validator';

export class LogInteractionDto {
  @IsNotEmpty()
  @IsString()
  session_id: string;

  @IsNotEmpty()
  @IsString()
  event_type: string; // Ví dụ: 'SEARCH_TRIP', 'VIEW_TRIP_DETAILS'

  @IsNotEmpty()
  @IsObject() // Hoặc IsJSON() tùy vào cách bạn cấu hình
  event_data: Record<string, any>; // Dùng Record<string, any> cho JSON
}