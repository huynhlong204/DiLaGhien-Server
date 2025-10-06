import { LocationService } from './location.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/index.dto';
export declare class LocationController {
    private readonly locationService;
    constructor(locationService: LocationService);
    create(createLocationDto: CreateLocationDto): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
    getAll(): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }[]>;
    getOne(id: number): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
    update(id: number, updateLocationDto: UpdateLocationDto): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
    delete(id: number): Promise<{
        name: string;
        id: number;
        address: string;
        province: string | null;
        commune: string | null;
        locationType: string | null;
        map_url: string | null;
    }>;
}
