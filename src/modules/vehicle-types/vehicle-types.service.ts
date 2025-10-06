import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Đảm bảo đường dẫn đúng
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { vehicle_types } from '@prisma/client'; // Import Prisma generated type

@Injectable()
export class VehicleTypesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Tạo một loại xe mới. Chỉ Admin mới có quyền này.
   * @param createVehicleTypeDto DTO chứa thông tin loại xe
   * @returns Loại xe đã được tạo
   */
  async create(createVehicleTypeDto: CreateVehicleTypeDto): Promise<vehicle_types> {
    const { name } = createVehicleTypeDto;
    const existingType = await this.prisma.vehicle_types.findUnique({
      where: { name },
    });
    if (existingType) {
      throw new BadRequestException(`Loại xe với tên '${name}' đã tồn tại.`);
    }
    return this.prisma.vehicle_types.create({
      data: createVehicleTypeDto,
    });
  }

  /**
   * Lấy tất cả các loại xe.
   * @returns Mảng các loại xe
   */
  async findAll(): Promise<vehicle_types[]> {
    return this.prisma.vehicle_types.findMany();
  }

  /**
   * Lấy một loại xe theo ID.
   * @param id ID của loại xe
   * @returns Loại xe tìm được
   */
  async findOne(id: number): Promise<vehicle_types> {
    const vehicleType = await this.prisma.vehicle_types.findUnique({
      where: { id },
    });
    if (!vehicleType) {
      throw new NotFoundException(`Loại xe với ID ${id} không tìm thấy.`);
    }
    return vehicleType;
  }

  /**
   * Cập nhật thông tin loại xe. Chỉ Admin mới có quyền này.
   * @param id ID của loại xe cần cập nhật
   * @param updateVehicleTypeDto DTO chứa thông tin cập nhật
   * @returns Loại xe đã được cập nhật
   */
  async update(id: number, updateVehicleTypeDto: UpdateVehicleTypeDto): Promise<vehicle_types> {
    await this.findOne(id); // Kiểm tra loại xe có tồn tại không
    if (updateVehicleTypeDto.name) {
      const existingType = await this.prisma.vehicle_types.findUnique({
        where: { name: updateVehicleTypeDto.name },
      });
      if (existingType && existingType.id !== id) {
        throw new BadRequestException(`Loại xe với tên '${updateVehicleTypeDto.name}' đã tồn tại.`);
      }
    }
    return this.prisma.vehicle_types.update({
      where: { id },
      data: updateVehicleTypeDto,
    });
  }

  /**
   * Xóa một loại xe. Chỉ Admin mới có quyền này.
   * Cần kiểm tra xem có xe nào đang sử dụng loại này không trước khi xóa.
   * @param id ID của loại xe cần xóa
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Kiểm tra loại xe có tồn tại không
    const vehiclesUsingType = await this.prisma.vehicles.count({
      where: { vehicle_type_id: id },
    });
    if (vehiclesUsingType > 0) {
      throw new BadRequestException(
        `Không thể xóa loại xe này vì có ${vehiclesUsingType} xe đang sử dụng.`,
      );
    }
    await this.prisma.vehicle_types.delete({
      where: { id },
    });
  }
}