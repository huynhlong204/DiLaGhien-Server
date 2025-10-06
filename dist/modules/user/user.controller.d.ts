import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        roles: {
            role_id: number;
            name: string;
            description: string | null;
        };
        transport_company: {
            created_at: Date;
            name: string;
            id: number;
            avatar_url: string | null;
            tax_code: string;
            address: string;
            contact_person: string;
            db_connection_string: string | null;
        } | null;
    } & {
        user_id: number;
        email: string;
        password_hash: string;
        role_id: number;
        company_id: number | null;
        phone: string;
        created_at: Date;
        updated_at: Date;
    }>;
    findAll(roleId?: string, companyId?: string): Promise<{
        roles: {
            name: string;
        };
        user_id: number;
        email: string;
        role_id: number;
        company_id: number | null;
        phone: string;
        created_at: Date;
        updated_at: Date;
        transport_company: {
            name: string;
        } | null;
    }[]>;
    findOne(id: number): Promise<{
        roles: {
            role_id: number;
            name: string;
            description: string | null;
        };
        transport_company: {
            created_at: Date;
            name: string;
            id: number;
            avatar_url: string | null;
            tax_code: string;
            address: string;
            contact_person: string;
            db_connection_string: string | null;
        } | null;
    } & {
        user_id: number;
        email: string;
        password_hash: string;
        role_id: number;
        company_id: number | null;
        phone: string;
        created_at: Date;
        updated_at: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        roles: {
            role_id: number;
            name: string;
            description: string | null;
        };
        transport_company: {
            created_at: Date;
            name: string;
            id: number;
            avatar_url: string | null;
            tax_code: string;
            address: string;
            contact_person: string;
            db_connection_string: string | null;
        } | null;
    } & {
        user_id: number;
        email: string;
        password_hash: string;
        role_id: number;
        company_id: number | null;
        phone: string;
        created_at: Date;
        updated_at: Date;
    }>;
    remove(id: number): Promise<{
        user_id: number;
        email: string;
        password_hash: string;
        role_id: number;
        company_id: number | null;
        phone: string;
        created_at: Date;
        updated_at: Date;
    }>;
}
