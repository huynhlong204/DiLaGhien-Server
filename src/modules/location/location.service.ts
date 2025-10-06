import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/index.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) { }

  async createLocation(createLocationDto: CreateLocationDto) {
    return this.prisma.locations.create({
      data: createLocationDto,
    });
  }

  async getAllLocations() {
    return this.prisma.locations.findMany();
  }

  async getOneLocation(id: number) {
    const location = await this.prisma.locations.findUnique({
      where: { id },
    });
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    return location;
  }

  async updateLocation(id: number, updateLocationDto: UpdateLocationDto) {
    return this.prisma.locations.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async deleteLocation(id: number) {
    return this.prisma.locations.delete({
      where: { id },
    });
  }
}