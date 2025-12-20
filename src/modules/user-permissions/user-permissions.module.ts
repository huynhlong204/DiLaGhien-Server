import { Module } from '@nestjs/common';
import { UserPermissionsService } from './user-permissions.service';
import { UserPermissionsController } from './user-permissions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserPermissionsController],
  providers: [UserPermissionsService],
})
export class UserPermissionsModule {}
