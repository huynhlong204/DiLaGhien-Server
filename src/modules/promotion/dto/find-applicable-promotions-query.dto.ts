import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer'; // Cần cài npm i class-transformer

export class FindApplicablePromotionsQueryDto {
    @IsInt()
    @Type(() => Number) // Chuyển đổi query param string thành number
    @Min(1)
    companyId: number;

    // Các tham số tùy chọn khác nếu cần
    // @IsInt()
    // @Type(() => Number)
    // @IsOptional()
    // customerId?: number;

    // @IsInt()
    // @Type(() => Number)
    // @IsOptional()
    // tripId?: number;
}