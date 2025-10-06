// strategies/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthUserService } from '../auth-user.service';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authUserService: AuthUserService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || (process.env.BE_URL ? `${process.env.BE_URL}/auth-user/google/callback` : 'http://localhost:8000/auth-user/google/callback'),
            scope: ['email', 'profile'],
            passReqToCallback: true,
        });
    }

    async validate(
        req: Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const userDetails = {
            email: emails?.[0]?.value,
            name: `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
            avatar_url: photos?.[0]?.value || null,
        };

        try {
            const user = await this.authUserService.validateOAuthUser(userDetails);
            return done(null, user);
        } catch (err) {
            return done(err as any, false);
        }
    }
}
