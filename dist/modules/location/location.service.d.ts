import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/index.dto';
export declare class LocationService {
    private prisma;
    constructor(prisma: PrismaService);
    createLocation(createLocationDto: CreateLocationDto): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
    getAllLocations(): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }[]>;
    getOneLocation(id: number): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
    updateLocation(id: number, updateLocationDto: UpdateLocationDto): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
    deleteLocation(id: number): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
}
