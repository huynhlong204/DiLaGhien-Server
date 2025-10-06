import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
export declare class RoleController {
    private readonly rolesService;
    constructor(rolesService: RoleService);
    getAllRoles(): Promise<({
        _count: {
            users: number;
        };
    } & {
        role_id: number;
        name: string;
        description: string | null;
    })[]>;
    getRoleById(id: number): Promise<({
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
    updateRole(id: number, dto: UpdateRoleDto): Promise<{
        role_id: number;
        name: string;
        description: string | null;
    }>;
    deleteRole(id: number): Promise<{
        role_id: number;
        name: string;
        description: string | null;
    }>;
    getRolePermissions(id: number): Promise<({
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
    updateRolePermissions(id: number, dto: UpdateRolePermissionsDto): Promise<{
        role_id: number;
        module_id: number;
        permissions_bitmask: number;
    }>;
}
