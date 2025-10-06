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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ModuleService = class ModuleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createModuleDto) {
        const existingModule = await this.prisma.modules.findUnique({
            where: { code: createModuleDto.code },
        });
        if (existingModule) {
            throw new common_1.BadRequestException('Mã module đã tồn tại.');
        }
        return this.prisma.modules.create({
            data: createModuleDto,
        });
    }
    async findAll() {
        return this.prisma.modules.findMany({
            include: {
                _count: { select: { role_module_permissions: true } },
            },
        });
    }
    async findOne(id) {
        const module = await this.prisma.modules.findUnique({
            where: { module_id: id },
            include: {
                role_module_permissions: {
                    include: { roles: true },
                },
            },
        });
        if (!module) {
            throw new common_1.BadRequestException('Module không tồn tại.');
        }
        return module;
    }
    async update(id, updateModuleDto) {
        const module = await this.prisma.modules.findUnique({
            where: { module_id: id },
        });
        if (!module) {
            throw new common_1.BadRequestException('Module không tồn tại.');
        }
        return this.prisma.modules.update({
            where: { module_id: id },
            data: updateModuleDto,
        });
    }
    async remove(id) {
        const module = await this.prisma.modules.findUnique({
            where: { module_id: id },
            include: { role_module_permissions: true },
        });
        if (!module) {
            throw new common_1.BadRequestException('Module không tồn tại.');
        }
        if (module.role_module_permissions.length > 0) {
            throw new common_1.BadRequestException('Không thể xóa module đang được sử dụng.');
        }
        return this.prisma.modules.delete({
            where: { module_id: id },
        });
    }
};
exports.ModuleService = ModuleService;
exports.ModuleService = ModuleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModuleService);
//# sourceMappingURL=module.service.js.map