import { CreateSeatLayoutTemplateDto } from './create-seat-layout-template.dto';
import { SeatLayoutDataDto } from './seat-layout.dto';
declare const UpdateSeatLayoutTemplateDto_base: import("@nestjs/common").Type<Partial<CreateSeatLayoutTemplateDto>>;
export declare class UpdateSeatLayoutTemplateDto extends UpdateSeatLayoutTemplateDto_base {
    layout_data?: SeatLayoutDataDto;
}
export {};
