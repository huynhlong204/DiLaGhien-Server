import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@Controller('admin/roles')
export class RoleController {
    constructor(private readonly rolesService: RoleService) {}

     // ✅ Lấy danh sách role
  @Get()
  getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  // ✅ Lấy 1 role và quyền
  @Get(':id')
  getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.getRoleById(id);
  }

  // ✅ Tạo role
  @Post()
  createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  // ✅ Cập nhật role
  @Put(':id')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(id, dto);
  }

   // ✅ Xoá role
   @Delete(':id')
   deleteRole(@Param('id', ParseIntPipe) id: number) {
     return this.rolesService.deleteRole(id);
   }
 
   // ✅ Lấy tất cả quyền module của role
   @Get(':id/permissions')
   getRolePermissions(@Param('id', ParseIntPipe) id: number) {
     return this.rolesService.getRolePermissions(id);
   }
 
   // ✅ Cập nhật quyền (bitmask) cho role/module
   @Put(':id/permissions')
   updateRolePermissions(
     @Param('id', ParseIntPipe) id: number,
     @Body() dto: UpdateRolePermissionsDto,
   ) {
     return this.rolesService.updateRolePermissions(id, dto);
   }
}
