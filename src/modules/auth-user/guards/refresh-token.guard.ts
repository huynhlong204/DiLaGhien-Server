// src/auth-user/guards/refresh-token.guard.ts (File Mới)
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-cus-refresh') { }