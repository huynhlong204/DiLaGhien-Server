import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { RoleModulePermissionsService } from './role-module-permissions.service';

@Controller('admin/role-module-permissions')
export class RoleModulePermissionsController {
  constructor(private readonly roleModulePermissionsService: RoleModulePermissionsService) { }

  @Get()
  async findAll() {
    return this.roleModulePermissionsService.findAll();
  }

  @Get(':roleId/:moduleId')
  async findOne(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.roleModulePermissionsService.findOne(roleId, moduleId);
  }

  @Post()
  async create(@Body() data: { role_id: number; module_id: number; permissions_bitmask: number }) {
    return this.roleModulePermissionsService.create(data);
  }

  @Put(':roleId/:moduleId')
  async update(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() data: { permissions_bitmask: number },
  ) {
    return this.roleModulePermissionsService.update(roleId, moduleId, data);
  }

  @Delete(':roleId/:moduleId')
  async delete(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ) {
    return this.roleModulePermissionsService.delete(roleId, moduleId);
  }
}