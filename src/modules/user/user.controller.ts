import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query, BadRequestException } from '@nestjs/common'; // Thêm Query
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  // Thêm các tham số Query để lọc
  findAll(
    @Query('role_id') roleId?: string, // role_id sẽ là string từ query, cần parse nếu là number
    @Query('company_id') companyId?: string, // company_id cũng là string từ query
  ) {
    // Tạo đối tượng lọc để truyền vào service
    const filterOptions: { role_id?: number; company_id?: number } = {};

    if (roleId) {
      filterOptions.role_id = parseInt(roleId, 10);
      if (isNaN(filterOptions.role_id)) {
        // Xử lý lỗi nếu roleId không phải số hợp lệ
        throw new BadRequestException('Role ID phải là số hợp lệ.');
      }
    }

    if (companyId) {
      filterOptions.company_id = parseInt(companyId, 10);
      if (isNaN(filterOptions.company_id)) {
        // Xử lý lỗi nếu companyId không phải số hợp lệ
        throw new BadRequestException('Company ID phải là số hợp lệ.');
      }
    }
    
    return this.userService.findAll(filterOptions); // Truyền đối tượng lọc
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}