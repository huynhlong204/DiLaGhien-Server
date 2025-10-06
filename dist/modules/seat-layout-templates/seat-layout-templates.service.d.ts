import { PrismaService } from '../../prisma/prisma.service';
import { CreateSeatLayoutTemplateDto } from './dto/create-seat-layout-template.dto';
import { UpdateSeatLayoutTemplateDto } from './dto/update-seat-layout-template.dto';
import { seat_layout_templates } from '@prisma/client';
import { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface';
export declare class SeatLayoutTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    private getRoleId;
    create(createDto: CreateSeatLayoutTemplateDto, user: AuthenticatedUser): Promise<seat_layout_templates>;
    findAll(user: AuthenticatedUser): Promise<seat_layout_templates[]>;
    findOne(id: number, user: AuthenticatedUser): Promise<seat_layout_templates>;
    update(id: number, updateDto: UpdateSeatLayoutTemplateDto, user: AuthenticatedUser): Promise<seat_layout_templates>;
    remove(id: number, user: AuthenticatedUser): Promise<void>;
}
