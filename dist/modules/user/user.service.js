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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createUserDto) {
        const { email, password, role_id, company_id, phone } = createUserDto;
        const existingUser = await this.prisma.users.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.BadRequestException('Email đã tồn tại.');
        }
        const role = await this.prisma.roles.findUnique({ where: { role_id } });
        if (!role) {
            throw new common_1.BadRequestException('Role không tồn tại.');
        }
        if (company_id) {
            const company = await this.prisma.transport_companies.findUnique({ where: { id: company_id } });
            if (!company) {
                throw new common_1.BadRequestException('Công ty không tồn tại.');
            }
        }
        const password_hash = await bcrypt.hash(password, 10);
        return this.prisma.users.create({
            data: {
                email,
                password_hash,
                role_id,
                company_id,
                phone: phone ?? '',
            },
            include: {
                roles: true,
                transport_company: true,
            },
        });
    }
    async findAll(filterOptions) {
        const whereClause = {};
        if (filterOptions?.role_id) {
            whereClause.role_id = filterOptions.role_id;
        }
        if (filterOptions?.company_id) {
            whereClause.company_id = filterOptions.company_id;
        }
        return this.prisma.users.findMany({
            where: whereClause,
            select: {
                user_id: true,
                email: true,
                phone: true,
                role_id: true,
                company_id: true,
                created_at: true,
                updated_at: true,
                roles: { select: { name: true } },
                transport_company: { select: { name: true } },
            },
        });
    }
    async findOne(id) {
        const user = await this.prisma.users.findUnique({
            where: { user_id: id },
            include: {
                roles: true,
                transport_company: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('User không tồn tại.');
        }
        return user;
    }
    async update(id, updateUserDto) {
        const user = await this.prisma.users.findUnique({ where: { user_id: id } });
        if (!user) {
            throw new common_1.BadRequestException('User không tồn tại.');
        }
        const data = { ...updateUserDto };
        if (updateUserDto.password) {
            data.password_hash = await bcrypt.hash(updateUserDto.password, 10);
            delete data.password;
        }
        if (updateUserDto.role_id) {
            const role = await this.prisma.roles.findUnique({ where: { role_id: updateUserDto.role_id } });
            if (!role) {
                throw new common_1.BadRequestException('Role không tồn tại.');
            }
        }
        if (updateUserDto.company_id) {
            const company = await this.prisma.transport_companies.findUnique({
                where: { id: updateUserDto.company_id },
            });
            if (!company) {
                throw new common_1.BadRequestException('Công ty không tồn tại.');
            }
        }
        return this.prisma.users.update({
            where: { user_id: id },
            data,
            include: {
                roles: true,
                transport_company: true,
            },
        });
    }
    async remove(id) {
        const user = await this.prisma.users.findUnique({ where: { user_id: id } });
        if (!user) {
            throw new common_1.BadRequestException('User không tồn tại.');
        }
        return this.prisma.users.delete({
            where: { user_id: id },
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map