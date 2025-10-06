// src/seat-layout-templates/dto/update-seat-layout-template.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSeatLayoutTemplateDto } from './create-seat-layout-template.dto';
import { ApiPropertyOptional } from '@nestjs/swagger'; // Thêm ApiPropertyOptional
import { ValidateNested, IsOptional } from 'class-validator'; // Thêm IsOptional
import { Type } from 'class-transformer';
import { SeatLayoutDataDto } from './seat-layout.dto'; // Thêm import này

// Kế thừa từ CreateSeatLayoutTemplateDto để lấy tất cả các trường và làm cho chúng tùy chọn
export class UpdateSeatLayoutTemplateDto extends PartialType(CreateSeatLayoutTemplateDto) {
    // Nếu bạn muốn override hoặc thêm validation cụ thể cho layout_data khi update, bạn có thể làm ở đây.
    // Nếu không, PartialType đã xử lý việc làm cho nó optional.
    // Tuy nhiên, để đảm bảo rõ ràng và cho Swagger, chúng ta có thể định nghĩa lại nó là optional.
    @ApiPropertyOptional({
        description: 'Dữ liệu chi tiết về sơ đồ ghế (cấu trúc JSON)',
        type: SeatLayoutDataDto,
    })
    @IsOptional() // Đảm bảo trường này là tùy chọn khi cập nhật
    @ValidateNested()
    @Type(() => SeatLayoutDataDto)
    layout_data?: SeatLayoutDataDto; // Đảm bảo kiểu dữ liệu là tùy chọn
}