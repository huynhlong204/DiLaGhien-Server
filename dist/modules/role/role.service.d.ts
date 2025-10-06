import { PrismaService } from '../../prisma/prisma.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
export declare class RoleService {
    private prisma;
    constructor(prisma: PrismaService);
    getAllRoles(): Promise<({
        _count: {
            users: number;
        };
    } & {
        role_id: number;
        name: string;
        description: string | null;
    })[]>;
    getRoleById(role_id: number): Promise<({
        role_module_permissions: ({
            modules: {
                name: string;
                description: string | null;
                module_id: number;
                code: string;
            };
        } & {
            role_id: number;
            module_id: number;
            permissions_bitmask: number;
        })[];
    } & {
        role_id: number;
        name: string;
        description: string | null;
    }) | null>;
    createRole(dto: CreateRoleDto): Promise<{
        role_id: number;
        name: string;
        description: string | null;
    }>;
    updateRole(role_id: number, dto: UpdateRoleDto): Promise<{
        role_id: number;
        name: string;
        description: string | null;
    }>;
    deleteRole(role_id: number): Promise<{
        role_id: number;
        name: string;
        description: string | null;
    }>;
    updateRolePermissions(role_id: number, dto: UpdateRolePermissionsDto): Promise<{
        role_id: number;
        module_id: number;
        permissions_bitmask: number;
    }>;
    getRolePermissions(role_id: number): Promise<({
        modules: {
            name: string;
            description: string | null;
            module_id: number;
            code: string;
        };
    } & {
        role_id: number;
        module_id: number;
        permissions_bitmask: number;
    })[]>;
}
