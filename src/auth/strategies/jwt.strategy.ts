import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Add the '!' here to assert the value is not null/undefined
      secretOrKey: configService.get<string>('JWT_SECRET_ADMIN')!,
    });

    console.log('JWT STRATEGY INSTANTIATED - Using secret:', process.env.JWT_SECRET_ADMIN);
  }


  async validate(payload: any): Promise<AuthenticatedUser> {
    const { user_id, role_id, company_id } = payload;

    const user = await this.prisma.users.findUnique({
      where: { user_id: user_id },
      include: {
        roles: true,
      },

    });
    if (!user || !user.roles) {
      throw new UnauthorizedException('Người dùng hoặc thông tin vai trò không tồn tại.');
    }
    if (user.company_id !== company_id && user.company_id !== null) {
      throw new UnauthorizedException('Thông tin công ty không khớp.');
    }
    if (user.company_id === null && company_id !== undefined && company_id !== null) {
      throw new UnauthorizedException('Admin không được có company_id.');
    }

    return {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      company_id: user.company_id,
      role: { name: user.roles.name },
    };
  }
}