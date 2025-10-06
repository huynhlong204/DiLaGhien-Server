import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
declare const RefreshJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RefreshJwtStrategy extends RefreshJwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(req: Request & {
        cookies?: Record<string, string>;
    }, payload: any): {
        sub: any;
        email: any;
        refreshToken: any;
    };
}
export {};
