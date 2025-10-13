// src/customers/customers.controller.ts

import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Patch,
    Body,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBody,
} from '@nestjs/swagger'; // <-- Import decorators
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers') // Nhóm các API này dưới tag 'customers' trên giao diện Swagger
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách tất cả khách hàng' }) // Mô tả ngắn gọn cho API
    @ApiResponse({ status: 200, description: 'Trả về danh sách khách hàng.' }) // Mô tả response thành công
    @ApiResponse({ status: 500, description: 'Lỗi máy chủ.' })
    findAll() {
        return this.customersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin chi tiết một khách hàng' })
    @ApiParam({ name: 'id', description: 'ID của khách hàng', type: Number }) // Mô tả parameter 'id'
    @ApiResponse({ status: 200, description: 'Trả về thông tin chi tiết khách hàng.' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng.' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.customersService.findOne(id);
    }


    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin khách hàng' })
    @ApiParam({ name: 'id', description: 'ID của khách hàng cần cập nhật' })
    @ApiBody({ type: UpdateCustomerDto }) // <-- Mô tả body cho Swagger
    @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng.' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ) {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Patch(':id/deactivate')
    @ApiOperation({ summary: 'Vô hiệu hóa tài khoản khách hàng' })
    @ApiParam({ name: 'id', description: 'ID của khách hàng cần vô hiệu hóa', type: Number })
    @ApiResponse({ status: 200, description: 'Tài khoản đã được vô hiệu hóa thành công.' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng.' })
    @HttpCode(HttpStatus.OK)
    deactivate(@Param('id', ParseIntPipe) id: number) {
        return this.customersService.deactivate(id);
    }

    @Patch(':id/activate')
    @ApiOperation({ summary: 'Kích hoạt lại tài khoản khách hàng' }) // Mô tả cho Swagger
    @ApiParam({ name: 'id', description: 'ID của khách hàng cần kích hoạt', type: Number })
    @ApiResponse({ status: 200, description: 'Tài khoản đã được kích hoạt thành công.' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy khách hàng.' })
    @HttpCode(HttpStatus.OK)
    activate(@Param('id', ParseIntPipe) id: number) {
        return this.customersService.activate(id);
    }
}