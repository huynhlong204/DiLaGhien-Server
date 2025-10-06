import { PrismaService } from '../../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
export declare class ModuleService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createModuleDto: CreateModuleDto): Promise<{
        name: string;
        description: string | null;
        module_id: number;
        code: string;
    }>;
    findAll(): Promise<({
        _count: {
            role_module_permissions: number;
        };
    } & {
        name: string;
        description: string | null;
        module_id: number;
        code: string;
    })[]>;
    findOne(id: number): Promise<{
        role_module_permissions: ({
            roles: {
                role_id: number;
                name: string;
                description: string | null;
            };
        } & {
            role_id: number;
            module_id: number;
            permissions_bitmask: number;
        })[];
    } & {
        name: string;
        description: string | null;
        module_id: number;
        code: string;
    }>;
    update(id: number, updateModuleDto: UpdateModuleDto): Promise<{
        name: string;
        description: string | null;
        module_id: number;
        code: string;
    }>;
    remove(id: number): Promise<{
        name: string;
        description: string | null;
        module_id: number;
        code: string;
    }>;
}
