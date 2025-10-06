import { VehicleTypesService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
export declare class VehicleTypesController {
    private readonly vehicleTypesService;
    constructor(vehicleTypesService: VehicleTypesService);
    create(createVehicleTypeDto: CreateVehicleTypeDto): Promise<{
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
    }>;
    findAll(): Promise<{
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
    }[]>;
    findOne(id: string): Promise<{
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
    }>;
    update(id: string, updateVehicleTypeDto: UpdateVehicleTypeDto): Promise<{
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
    }>;
    remove(id: string): Promise<void>;
}
