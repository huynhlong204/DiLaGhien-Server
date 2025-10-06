"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUserModule = void 0;
const common_1 = require("@nestjs/common");
const auth_user_service_1 = require("./auth-user.service");
const auth_user_controller_1 = require("./auth-user.controller");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const local_strategy_1 = require("./strategies/local.strategy");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const google_strategy_1 = require("./strategies/google.strategy");
const prisma_module_1 = require("../../prisma/prisma.module");
const refresh_jwt_strategy_1 = require("./strategies/refresh-jwt.strategy");
let AuthUserModule = class AuthUserModule {
};
exports.AuthUserModule = AuthUserModule;
exports.AuthUserModule = AuthUserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            config_1.ConfigModule,
            jwt_1.JwtModule.register({}),
        ],
        controllers: [auth_user_controller_1.AuthUserController],
        providers: [
            auth_user_service_1.AuthUserService,
            local_strategy_1.LocalStrategy,
            jwt_strategy_1.JwtStrategy,
            google_strategy_1.GoogleStrategy,
            refresh_jwt_strategy_1.RefreshJwtStrategy,
        ],
        exports: [auth_user_service_1.AuthUserService],
    })
], AuthUserModule);
//# sourceMappingURL=auth-user.module.js.map