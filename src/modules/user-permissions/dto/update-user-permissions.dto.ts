import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PermissionUpdateItemDto {
  @IsInt()
  moduleId: number;

  @IsInt()
  permissionsBitmask: number;
}

export class UpdateUserPermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionUpdateItemDto)
  permissions: PermissionUpdateItemDto[];
}
