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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CompanyService = class CompanyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCompanyDto) {
        if (!createCompanyDto.tax_code) {
            throw new common_1.BadRequestException('Mã số thuế là bắt buộc.');
        }
        const existingCompany = await this.prisma.transport_companies.findFirst({
            where: { tax_code: createCompanyDto.tax_code },
        });
        if (existingCompany) {
            throw new common_1.BadRequestException('Mã số thuế đã tồn tại.');
        }
        return this.prisma.transport_companies.create({
            data: createCompanyDto,
        });
    }
    async findAll() {
        return this.prisma.transport_companies.findMany({
            include: {
                _count: { select: { users: true } },
            },
        });
    }
    async findOne(id) {
        const company = await this.prisma.transport_companies.findUnique({
            where: { id },
            include: {
                users: {
                    select: { user_id: true, email: true, role_id: true },
                },
            },
        });
        if (!company) {
            throw new common_1.BadRequestException('Công ty không tồn tại.');
        }
        return company;
    }
    async update(id, updateCompanyDto) {
        const company = await this.prisma.transport_companies.findUnique({
            where: { id },
        });
        if (!company) {
            throw new common_1.BadRequestException('Công ty không tồn tại.');
        }
        return this.prisma.transport_companies.update({
            where: { id },
            data: updateCompanyDto,
        });
    }
    async remove(id) {
        const company = await this.prisma.transport_companies.findUnique({
            where: { id },
            include: { users: true },
        });
        if (!company) {
            throw new common_1.BadRequestException('Công ty không tồn tại.');
        }
        if (company.users.length > 0) {
            throw new common_1.BadRequestException('Không thể xóa công ty đang có người dùng.');
        }
        return this.prisma.transport_companies.delete({
            where: { id },
        });
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompanyService);
//# sourceMappingURL=company.service.js.map