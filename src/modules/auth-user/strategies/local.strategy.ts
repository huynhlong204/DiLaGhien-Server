import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthUserService } from '../auth-user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authUserService: AuthUserService) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<any> {
        const user = await this.authUserService.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
        }
        return user;
    }
}