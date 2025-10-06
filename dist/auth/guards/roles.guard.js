"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const handler = context.getHandler();
        const classRef = context.getClass();
        console.log('RolesGuard - Current Handler:', handler.name);
        console.log('RolesGuard - Current Class:', classRef.name);
        const requiredRolesMethod = this.reflector.get(roles_decorator_1.ROLES_KEY, handler);
        const requiredRolesClass = this.reflector.get(roles_decorator_1.ROLES_KEY, classRef);
        console.log('RolesGuard - Roles on Method:', requiredRolesMethod);
        console.log('RolesGuard - Roles on Class:', requiredRolesClass);
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            handler,
            classRef,
        ]);
        const { user } = context.switchToHttp().getRequest();
        console.log('RolesGuard - User object:', user);
        console.log('RolesGuard - User role name:', user?.role?.name);
        console.log('RolesGuard - Required roles from @Roles decorator:', requiredRoles);
        if (!requiredRoles) {
            console.log('RolesGuard: No @Roles decorator found, allowing access.');
            return true;
        }
        if (!user || !user.role || !user.role.name) {
            console.log('RolesGuard: User or user role name is missing from AuthenticatedUser.');
            return false;
        }
        const hasPermission = requiredRoles.some((role) => user.role.name === role);
        if (!hasPermission) {
            console.log(`RolesGuard: User with role "${user.role.name}" does not have required roles: [${requiredRoles.join(', ')}]`);
        }
        return hasPermission;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map