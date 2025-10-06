import { SeatLayoutDataDto } from './seat-layout.dto';
export declare class CreateSeatLayoutTemplateDto {
    name: string;
    seat_count: number;
    description?: string;
    layout_data: SeatLayoutDataDto;
}
