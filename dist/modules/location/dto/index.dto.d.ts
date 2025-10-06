export declare class CreateLocationDto {
    name: string;
    address: string;
    map_url?: string;
    province?: string;
    commune?: string;
}
export declare class UpdateLocationDto {
    name?: string;
    address?: string;
    map_url?: string;
    province?: string;
    commune?: string;
    locationType?: string;
}
