// src/auth-user/strategies/refresh-jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-cus-refresh') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request & { cookies?: Record<string, string> }) => {
                    return request?.cookies?.refresh_token;
                },
            ]),
            secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') || '',
            passReqToCallback: true,
        });
    }

    validate(req: Request & { cookies?: Record<string, string> }, payload: any) {
        const refreshToken = req.cookies.refresh_token;
        return { sub: payload.sub, email: payload.email, refreshToken };
    }
}