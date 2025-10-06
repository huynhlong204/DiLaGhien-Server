import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, role_id, company_id, phone } = createUserDto;

    const existingUser = await this.prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại.');
    }

    const role = await this.prisma.roles.findUnique({ where: { role_id } });
    if (!role) {
      throw new BadRequestException('Role không tồn tại.');
    }

    if (company_id) {
      const company = await this.prisma.transport_companies.findUnique({ where: { id: company_id } });
      if (!company) {
        throw new BadRequestException('Công ty không tồn tại.');
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


  async findAll(filterOptions?: { role_id?: number; company_id?: number }) { // Thêm tham số filterOptions
    const whereClause: any = {};

    if (filterOptions?.role_id) {
      whereClause.role_id = filterOptions.role_id;
    }
    if (filterOptions?.company_id) {
      whereClause.company_id = filterOptions.company_id;
    }

    return this.prisma.users.findMany({
      where: whereClause, // Áp dụng điều kiện lọc vào đây
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

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      include: {
        roles: true,
        transport_company: true,
      },
    });
    if (!user) {
      throw new BadRequestException('User không tồn tại.');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.users.findUnique({ where: { user_id: id } });
    if (!user) {
      throw new BadRequestException('User không tồn tại.');
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password_hash = await bcrypt.hash(updateUserDto.password, 10);
      delete data.password;
    }
    if (updateUserDto.role_id) {
      const role = await this.prisma.roles.findUnique({ where: { role_id: updateUserDto.role_id } });
      if (!role) {
        throw new BadRequestException('Role không tồn tại.');
      }
    }
    if (updateUserDto.company_id) {
      const company = await this.prisma.transport_companies.findUnique({
        where: { id: updateUserDto.company_id },
      });
      if (!company) {
        throw new BadRequestException('Công ty không tồn tại.');
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

  async remove(id: number) {
    const user = await this.prisma.users.findUnique({ where: { user_id: id } });
    if (!user) {
      throw new BadRequestException('User không tồn tại.');
    }
    return this.prisma.users.delete({
      where: { user_id: id },
    });
  }
}