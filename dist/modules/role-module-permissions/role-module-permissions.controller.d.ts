import { RoleModulePermissionsService } from './role-module-permissions.service';
export declare class RoleModulePermissionsController {
    private readonly roleModulePermissionsService;
    constructor(roleModulePermissionsService: RoleModulePermissionsService);
    findAll(): Promise<{
        permissions_bitmask: number;
        permissions: {
            name: string;
            bit_value: number;
        }[];
        roles: {
            name: string;
        };
        modules: {
            name: string;
        };
        role_id: number;
        module_id: number;
    }[]>;
    create(data: {
        role_id: number;
        module_id: number;
        permissions_bitmask: number;
    }): Promise<{
        permissions_bitmask: number;
        roles: {
            name: string;
        };
        modules: {
            name: string;
        };
        role_id: number;
        module_id: number;
    }>;
    update(roleId: number, moduleId: number, data: {
        permissions_bitmask: number;
    }): Promise<{
        permissions_bitmask: number;
        roles: {
            name: string;
        };
        modules: {
            name: string;
        };
        role_id: number;
        module_id: number;
    }>;
    delete(roleId: number, moduleId: number): Promise<{
        message: string;
    }>;
}
