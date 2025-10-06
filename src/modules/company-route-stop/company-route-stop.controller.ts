import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyRouteStopsService } from './company-route-stop.service';
import { CreateCompanyRouteStopDto } from './dto/create-company-route-stop.dto';
import { UpdateCompanyRouteStopDto } from './dto/update-company-route-stop.dto';

@Controller('company-route-stops')
export class CompanyRouteStopsController {
  constructor(private readonly companyRouteStopsService: CompanyRouteStopsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCompanyRouteStopDto: CreateCompanyRouteStopDto) {
    return this.companyRouteStopsService.create(createCompanyRouteStopDto);
  }

  @Get()
  findAll() {
    return this.companyRouteStopsService.findAll();
  }

  @Get('by-company-route/:companyRouteId')
  findByCompanyRouteId(@Param('companyRouteId', ParseIntPipe) companyRouteId: number) {
    return this.companyRouteStopsService.findByCompanyRouteId(companyRouteId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companyRouteStopsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyRouteStopDto: UpdateCompanyRouteStopDto,
  ) {
    return this.companyRouteStopsService.update(id, updateCompanyRouteStopDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.companyRouteStopsService.remove(id);
  }
}