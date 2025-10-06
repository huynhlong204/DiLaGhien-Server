// src/auth/guards/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs'; // Có thể không cần nếu không dùng Observables
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Debugging the reflector itself
    const handler = context.getHandler();
    const classRef = context.getClass();

    console.log('RolesGuard - Current Handler:', handler.name); // Tên phương thức
    console.log('RolesGuard - Current Class:', classRef.name); // Tên Controller Class

    const requiredRolesMethod = this.reflector.get<UserRole[]>(ROLES_KEY, handler);
    const requiredRolesClass = this.reflector.get<UserRole[]>(ROLES_KEY, classRef);

    console.log('RolesGuard - Roles on Method:', requiredRolesMethod);
    console.log('RolesGuard - Roles on Class:', requiredRolesClass);


    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      handler,
      classRef,
    ]);

    // Các log hiện có của bạn
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
}