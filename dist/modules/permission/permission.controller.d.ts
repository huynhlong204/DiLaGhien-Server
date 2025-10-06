import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
export declare class PermissionController {
    private readonly permissionService;
    constructor(permissionService: PermissionService);
    create(createPermissionDto: CreatePermissionDto): Promise<{
        name: string;
        description: string | null;
        module_id: number;
        permission_id: number;
        bit_value: number;
    }>;
    findAll(): Promise<{
        _count: number;
        name: string;
        description: string | null;
        permission_id: number;
        bit_value: number;
    }[]>;
    findOne(id: number): Promise<{
        modules: {
            name: string;
            description: string | null;
            module_id: number;
            code: string;
        };
    } & {
        name: string;
        description: string | null;
        module_id: number;
        permission_id: number;
        bit_value: number;
    }>;
    update(id: number, updatePermissionDto: UpdatePermissionDto): Promise<{
        name: string;
        description: string | null;
        module_id: number;
        permission_id: number;
        bit_value: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        description: string | null;
        module_id: number;
        permission_id: number;
        bit_value: number;
    }>;
}
