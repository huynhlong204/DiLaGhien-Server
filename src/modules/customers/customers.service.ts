// src/customers/customers.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { CustomerStatus } from '@prisma/client';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    /**
     * Lấy tất cả khách hàng đang hoạt động (ACTIVE)
     * Bao gồm cả thông tin profile liên quan
     */
    async findAll() {
        const customers = await this.prisma.customers.findMany({
            include: {
                customer_profiles: true, // Lấy kèm thông tin profile
            },
        });

        // Loại bỏ password_hash trước khi trả về
        return customers.map(({ password_hash, ...customer }) => customer);
    }

    /**
     * Lấy thông tin chi tiết một khách hàng theo ID
     * @param customerId ID của khách hàng
     */
    async findOne(customerId: number) {
        const customer = await this.prisma.customers.findUnique({
            where: {
                customer_id: customerId,
            },
            include: {
                customer_profiles: true,
            },
        });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${customerId} not found`);
        }

        // Loại bỏ password_hash trước khi trả về
        const { password_hash, ...result } = customer;
        return result;
    }

    async update(customerId: number, dto: UpdateCustomerDto) {
        await this.findOne(customerId); // Kiểm tra khách hàng tồn tại

        const { name, ...customerData } = dto;

        const updatedCustomer = await this.prisma.customers.update({
            where: { customer_id: customerId },
            data: {
                ...customerData, // Cập nhật email, phone vào bảng customers
                customer_profiles: {
                    update: {
                        name: name, // Cập nhật name vào bảng customer_profiles
                    },
                },
            },
            include: {
                customer_profiles: true,
            },
        });

        const { password_hash, ...result } = updatedCustomer;
        return result;
    }

    /**
     * Vô hiệu hóa tài khoản khách hàng (soft-delete)
     * @param customerId ID của khách hàng
     */
    async deactivate(customerId: number) {
        await this.findOne(customerId);

        const deactivatedCustomer = await this.prisma.customers.update({
            where: {
                customer_id: customerId,
            },
            data: {
                status: CustomerStatus?.INACTIVE,
            },
        });

        const { password_hash, ...result } = deactivatedCustomer;
        return result;
    }

    /**
     * Kích hoạt lại tài khoản khách hàng
     * @param customerId ID của khách hàng
     */
    async activate(customerId: number) {
        await this.findOne(customerId); // Tái sử dụng để kiểm tra khách hàng có tồn tại không

        const activatedCustomer = await this.prisma.customers.update({
            where: {
                customer_id: customerId,
            },
            data: {
                status: CustomerStatus.ACTIVE, // Cập nhật trạng thái thành ACTIVE
            },
        });

        // Loại bỏ password_hash trước khi trả về
        const { password_hash, ...result } = activatedCustomer;
        return result;
    }
}