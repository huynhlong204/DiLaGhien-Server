import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserPermissionsService } from './user-permissions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';

@Controller('user-permissions')
@UseGuards(JwtAuthGuard)
export class UserPermissionsController {
  constructor(private readonly service: UserPermissionsService) {}

  @Get(':userId')
  async getUserPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    const user: AuthenticatedUser = req.user;
    return this.service.findByUser(userId, user);
  }

  @Put(':userId')
  async updateUserPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdateUserPermissionsDto,
    @Request() req,
  ) {
    const user: AuthenticatedUser = req.user;
    return this.service.update(userId, dto, user);
  }
}
