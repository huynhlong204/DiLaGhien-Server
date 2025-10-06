import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Request } from 'express';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(createVehicleDto: CreateVehicleDto, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        id: number;
        vehicle_type_id: number | null;
        status: string;
        plate_number: string;
        brand: string;
        seat_layout_template_id: number | null;
    }>;
    findAll(req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        id: number;
        vehicle_type_id: number | null;
        status: string;
        plate_number: string;
        brand: string;
        seat_layout_template_id: number | null;
    }[]>;
    findOne(id: string, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        id: number;
        vehicle_type_id: number | null;
        status: string;
        plate_number: string;
        brand: string;
        seat_layout_template_id: number | null;
    }>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        id: number;
        vehicle_type_id: number | null;
        status: string;
        plate_number: string;
        brand: string;
        seat_layout_template_id: number | null;
    }>;
    remove(id: string, req: Request): Promise<void>;
}
