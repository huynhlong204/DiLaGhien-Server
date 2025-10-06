// src/auth-user/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface CustomerJwtPayload {
    sub: number;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-cus') {
    constructor(private configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('FATAL_ERROR: JWT_SECRET for auth-user is not defined!');
        }
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request & { cookies?: Record<string, string> }) => {
                    return request?.cookies?.access_token;
                },
            ]),
            secretOrKey: secret,
            ignoreExpiration: false,
        });
    }

    // Hàm này chỉ xác thực payload, không gọi DB
    async validate(payload: CustomerJwtPayload): Promise<any> {
        if (!payload || !payload.sub) {
            throw new UnauthorizedException('Invalid customer token.');
        }
        // Trả về đối tượng gọn nhẹ để gắn vào req.user
        return {
            customer_id: payload.sub,
            email: payload.email,
        };
    }
}