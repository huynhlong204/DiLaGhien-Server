import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
export declare class CompanyController {
    private readonly companyService;
    constructor(companyService: CompanyService);
    create(createCompanyDto: CreateCompanyDto): Promise<{
        created_at: Date;
        name: string;
        id: number;
        avatar_url: string | null;
        tax_code: string;
        address: string;
        contact_person: string;
        db_connection_string: string | null;
    }>;
    findAll(): Promise<({
        _count: {
            users: number;
        };
    } & {
        created_at: Date;
        name: string;
        id: number;
        avatar_url: string | null;
        tax_code: string;
        address: string;
        contact_person: string;
        db_connection_string: string | null;
    })[]>;
    findOne(id: number): Promise<{
        users: {
            user_id: number;
            email: string;
            role_id: number;
        }[];
    } & {
        created_at: Date;
        name: string;
        id: number;
        avatar_url: string | null;
        tax_code: string;
        address: string;
        contact_person: string;
        db_connection_string: string | null;
    }>;
    update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<{
        created_at: Date;
        name: string;
        id: number;
        avatar_url: string | null;
        tax_code: string;
        address: string;
        contact_person: string;
        db_connection_string: string | null;
    }>;
    remove(id: number): Promise<{
        created_at: Date;
        name: string;
        id: number;
        avatar_url: string | null;
        tax_code: string;
        address: string;
        contact_person: string;
        db_connection_string: string | null;
    }>;
}
