import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) { }

  async create(createCompanyDto: CreateCompanyDto) {
    if (!createCompanyDto.tax_code) {
      throw new BadRequestException('Mã số thuế là bắt buộc.');
    }
    const existingCompany = await this.prisma.transport_companies.findFirst({
      where: { tax_code: createCompanyDto.tax_code },
    });
    if (existingCompany) {
      throw new BadRequestException('Mã số thuế đã tồn tại.');
    }
    return this.prisma.transport_companies.create({
      data: createCompanyDto as any, // Still better to make DTO match Prisma input
    });
  }

  async findAll() {
    return this.prisma.transport_companies.findMany({
      include: {
        _count: { select: { users: true } },
      },
    });
  }

  async findOne(id: number) {
    const company = await this.prisma.transport_companies.findUnique({
      where: { id },
      include: {
        users: {
          select: { user_id: true, email: true, role_id: true },
        },
      },
    });
    if (!company) {
      throw new BadRequestException('Công ty không tồn tại.');
    }
    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.prisma.transport_companies.findUnique({
      where: { id },
    });
    if (!company) {
      throw new BadRequestException('Công ty không tồn tại.');
    }
    return this.prisma.transport_companies.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: number) {
    const company = await this.prisma.transport_companies.findUnique({
      where: { id },
      include: { users: true },
    });
    if (!company) {
      throw new BadRequestException('Công ty không tồn tại.');
    }
    if (company.users.length > 0) {
      throw new BadRequestException('Không thể xóa công ty đang có người dùng.');
    }
    return this.prisma.transport_companies.delete({
      where: { id },
    });
  }
}