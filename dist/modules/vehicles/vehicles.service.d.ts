import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { vehicles } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    private getRoleId;
    create(createVehicleDto: CreateVehicleDto, user: AuthenticatedUser): Promise<vehicles>;
    findAll(user: AuthenticatedUser): Promise<vehicles[]>;
    findOne(id: number, user: AuthenticatedUser): Promise<vehicles>;
    update(id: number, updateVehicleDto: UpdateVehicleDto, user: AuthenticatedUser): Promise<vehicles>;
    remove(id: number, user: AuthenticatedUser): Promise<void>;
}
