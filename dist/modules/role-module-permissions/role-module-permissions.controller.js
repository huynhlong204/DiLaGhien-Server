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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModulePermissionsController = void 0;
const common_1 = require("@nestjs/common");
const role_module_permissions_service_1 = require("./role-module-permissions.service");
let RoleModulePermissionsController = class RoleModulePermissionsController {
    roleModulePermissionsService;
    constructor(roleModulePermissionsService) {
        this.roleModulePermissionsService = roleModulePermissionsService;
    }
    async findAll() {
        return this.roleModulePermissionsService.findAll();
    }
    async create(data) {
        return this.roleModulePermissionsService.create(data);
    }
    async update(roleId, moduleId, data) {
        return this.roleModulePermissionsService.update(roleId, moduleId, data);
    }
    async delete(roleId, moduleId) {
        return this.roleModulePermissionsService.delete(roleId, moduleId);
    }
};
exports.RoleModulePermissionsController = RoleModulePermissionsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoleModulePermissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleModulePermissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':roleId/:moduleId'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('moduleId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], RoleModulePermissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':roleId/:moduleId'),
    __param(0, (0, common_1.Param)('roleId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('moduleId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], RoleModulePermissionsController.prototype, "delete", null);
exports.RoleModulePermissionsController = RoleModulePermissionsController = __decorate([
    (0, common_1.Controller)('admin/role-module-permissions'),
    __metadata("design:paramtypes", [role_module_permissions_service_1.RoleModulePermissionsService])
], RoleModulePermissionsController);
//# sourceMappingURL=role-module-permissions.controller.js.map