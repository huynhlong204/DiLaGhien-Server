import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    adminLogin(loginDto: LoginDto, res: Response): Promise<{
        user_id: any;
        email: any;
        role_name: any;
        company_id: any;
        company_name: any;
        permissions: {
            module_name: string;
            module_code: string;
            permissions: string[];
        }[];
    }>;
    companyLogin(loginDto: LoginDto, res: Response): Promise<{
        user_id: any;
        email: any;
        role_name: any;
        company_id: any;
        company_name: any;
        permissions: {
            module_name: string;
            module_code: string;
            permissions: string[];
        }[];
    }>;
    private createSessionAndSetCookies;
    refreshToken(refreshToken: string, res: Response): Promise<{
        message: string;
        access_token: string;
    }>;
    logout(user_id: number, access_token: string, res: Response): Promise<{
        message: string;
    }>;
    getUserPermissions(role_id: number): Promise<{
        module_name: string;
        module_code: string;
        permissions: string[];
    }[]>;
    private getPermissionsFromBitmask;
    validateToken(user_id: number, request: Request): Promise<boolean>;
    private generateAccessToken;
    private generateRefreshToken;
    getCurrentUser(user_id: number): Promise<{
        user_id: number;
        email: string;
        role_name: string;
        company_id: number | null;
        company_name: string | null;
        permissions: {
            module_name: string;
            module_code: string;
            permissions: string[];
        }[];
    }>;
}
