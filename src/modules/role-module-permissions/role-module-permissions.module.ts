import { Module } from '@nestjs/common';
import { RoleModulePermissionsService } from './role-module-permissions.service';
import { RoleModulePermissionsController } from './role-module-permissions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoleModulePermissionsController],
  providers: [RoleModulePermissionsService],
})
export class RoleModulePermissionsModule {}
