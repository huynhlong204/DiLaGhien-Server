import { IsInt } from 'class-validator';

export class UpdateRolePermissionsDto {
  @IsInt()
  module_id: number;

  @IsInt()
  permissions_bitmask: number;
}
