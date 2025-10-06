declare const SEAT_TYPES: readonly ["standard", "vip", "aisle", "disabled", "empty", "bed", "room", "vip_room", "double_room"];
type SeatType = typeof SEAT_TYPES[number];
export declare class SeatDto {
    row: number;
    col: number;
    number: string;
    type: SeatType;
}
export declare class SectionDto {
    section_id: string;
    name: string;
    rows: number;
    cols: number;
    seats: SeatDto[];
}
export declare class FloorDto {
    floor_number: number;
    name: string;
    sections: SectionDto[];
}
export declare class SeatLayoutDataDto {
    total_capacity: number;
    floors: FloorDto[];
    [key: string]: any;
}
export {};
