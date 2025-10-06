import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { vehicle_types } from '@prisma/client';
export declare class VehicleTypesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createVehicleTypeDto: CreateVehicleTypeDto): Promise<vehicle_types>;
    findAll(): Promise<vehicle_types[]>;
    findOne(id: number): Promise<vehicle_types>;
    update(id: number, updateVehicleTypeDto: UpdateVehicleTypeDto): Promise<vehicle_types>;
    remove(id: number): Promise<void>;
}
