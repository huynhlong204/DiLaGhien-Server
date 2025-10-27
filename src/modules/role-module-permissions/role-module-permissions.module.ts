import { Module } from '@nestjs/common';
import { RoleModulePermissionsService } from './role-module-permissions.service';
import { RoleModulePermissionsController } from './role-module-permissions.controller';

@Module({
  controllers: [RoleModulePermissionsController],
  providers: [RoleModulePermissionsService],
})
export class RoleModulePermissionsModule {}
