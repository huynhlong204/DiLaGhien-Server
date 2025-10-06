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
exports.SeatLayoutTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const role_enum_1 = require("../../auth/enums/role.enum");
let SeatLayoutTemplatesService = class SeatLayoutTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRoleId(roleName) {
        const role = await this.prisma.roles.findUnique({
            where: { name: roleName },
            select: { role_id: true },
        });
        if (!role) {
            throw new Error(`Role '${roleName}' not found in database. Please seed roles.`);
        }
        return role.role_id;
    }
    async create(createDto, user) {
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id !== ownerRoleId) {
            throw new common_1.ForbiddenException('Bạn không có quyền tạo sơ đồ ghế. Chỉ Owner mới có thể thực hiện thao tác này.');
        }
        if (user.company_id === null) {
            throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty để tạo sơ đồ ghế.');
        }
        const companyIdToAssign = user.company_id;
        const existingTemplate = await this.prisma.seat_layout_templates.findFirst({
            where: {
                name: createDto.name,
                company_id: companyIdToAssign,
            },
        });
        if (existingTemplate) {
            throw new common_1.BadRequestException(`Sơ đồ ghế với tên '${createDto.name}' đã tồn tại trong phạm vi công ty này.`);
        }
        return this.prisma.seat_layout_templates.create({
            data: {
                ...createDto,
                company_id: companyIdToAssign,
            },
        });
    }
    async findAll(user) {
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === adminRoleId) {
            return this.prisma.seat_layout_templates.findMany();
        }
        else if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
            }
            return this.prisma.seat_layout_templates.findMany({
                where: {
                    company_id: user.company_id,
                },
            });
        }
        throw new common_1.ForbiddenException('Bạn không có quyền xem sơ đồ ghế.');
    }
    async findOne(id, user) {
        const template = await this.prisma.seat_layout_templates.findUnique({
            where: { id },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Sơ đồ ghế với ID ${id} không tìm thấy.`);
        }
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === adminRoleId) {
            return template;
        }
        else if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
            }
            if (template.company_id === user.company_id) {
                return template;
            }
            throw new common_1.ForbiddenException('Bạn không có quyền truy cập sơ đồ ghế này.');
        }
        throw new common_1.ForbiddenException('Bạn không có quyền xem sơ đồ ghế.');
    }
    async update(id, updateDto, user) {
        const existingTemplate = await this.prisma.seat_layout_templates.findUnique({
            where: { id },
        });
        if (!existingTemplate) {
            throw new common_1.NotFoundException(`Sơ đồ ghế với ID ${id} không tìm thấy.`);
        }
        if (typeof updateDto.company_id !== 'undefined') {
            throw new common_1.BadRequestException('Không được phép cập nhật company_id.');
        }
        if (updateDto.name && updateDto.name !== existingTemplate.name) {
            const duplicateTemplate = await this.prisma.seat_layout_templates.findFirst({
                where: {
                    name: updateDto.name,
                    company_id: existingTemplate.company_id,
                    NOT: { id: existingTemplate.id },
                },
            });
            if (duplicateTemplate) {
                throw new common_1.BadRequestException(`Sơ đồ ghế với tên '${updateDto.name}' đã tồn tại trong phạm vi công ty này.`);
            }
        }
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === adminRoleId) {
            return this.prisma.seat_layout_templates.update({
                where: { id },
                data: updateDto,
            });
        }
        else if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
            }
            if (existingTemplate.company_id === user.company_id) {
                return this.prisma.seat_layout_templates.update({
                    where: { id },
                    data: updateDto,
                });
            }
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật sơ đồ ghế này.');
        }
        throw new common_1.ForbiddenException('Bạn không có quyền cập nhật sơ đồ ghế.');
    }
    async remove(id, user) {
        const existingTemplate = await this.prisma.seat_layout_templates.findUnique({
            where: { id },
        });
        if (!existingTemplate) {
            throw new common_1.NotFoundException(`Sơ đồ ghế với ID ${id} không tìm thấy.`);
        }
        const vehiclesUsingTemplate = await this.prisma.vehicles.count({
            where: { seat_layout_template_id: id },
        });
        if (vehiclesUsingTemplate > 0) {
            throw new common_1.BadRequestException(`Không thể xóa sơ đồ ghế này vì có ${vehiclesUsingTemplate} xe đang sử dụng.`);
        }
        const adminRoleId = await this.getRoleId(role_enum_1.UserRole.ADMIN);
        const ownerRoleId = await this.getRoleId(role_enum_1.UserRole.OWNER);
        if (user.role_id === adminRoleId) {
            await this.prisma.seat_layout_templates.delete({
                where: { id },
            });
        }
        else if (user.role_id === ownerRoleId) {
            if (user.company_id === null) {
                throw new common_1.BadRequestException('Người dùng nhà xe phải thuộc về một công ty.');
            }
            if (existingTemplate.company_id === user.company_id) {
                await this.prisma.seat_layout_templates.delete({
                    where: { id },
                });
            }
            else {
                throw new common_1.ForbiddenException('Bạn không có quyền xóa sơ đồ ghế này.');
            }
        }
        else {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa sơ đồ ghế.');
        }
    }
};
exports.SeatLayoutTemplatesService = SeatLayoutTemplatesService;
exports.SeatLayoutTemplatesService = SeatLayoutTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeatLayoutTemplatesService);
//# sourceMappingURL=seat-layout-templates.service.js.map