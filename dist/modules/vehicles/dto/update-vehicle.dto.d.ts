import { CreateVehicleDto } from './create-vehicle.dto';
declare const UpdateVehicleDto_base: import("@nestjs/common").Type<Partial<CreateVehicleDto>>;
export declare class UpdateVehicleDto extends UpdateVehicleDto_base {
    plate_number?: string;
    brand?: string;
    status?: string;
    vehicle_type_id?: number;
    seat_layout_template_id?: number;
}
export {};
