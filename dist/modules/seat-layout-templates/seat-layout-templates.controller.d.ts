import { SeatLayoutTemplatesService } from './seat-layout-templates.service';
import { CreateSeatLayoutTemplateDto } from './dto/create-seat-layout-template.dto';
import { UpdateSeatLayoutTemplateDto } from './dto/update-seat-layout-template.dto';
import { Request } from 'express';
export declare class SeatLayoutTemplatesController {
    private readonly seatLayoutTemplatesService;
    constructor(seatLayoutTemplatesService: SeatLayoutTemplatesService);
    create(createSeatLayoutTemplateDto: CreateSeatLayoutTemplateDto, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
        seat_count: number;
        layout_data: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
        seat_count: number;
        layout_data: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    findOne(id: string, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
        seat_count: number;
        layout_data: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    update(id: string, updateSeatLayoutTemplateDto: UpdateSeatLayoutTemplateDto, req: Request): Promise<{
        company_id: number;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string | null;
        id: number;
        seat_count: number;
        layout_data: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    remove(id: string, req: Request): Promise<void>;
}
