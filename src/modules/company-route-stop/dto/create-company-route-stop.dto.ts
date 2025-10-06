import {
    IsInt,
    IsBoolean,
    IsOptional,
    Min,
    IsNotEmpty,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateCompanyRouteStopDto {
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    company_route_id: number;
  
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    location_id: number;
  
    @IsInt()
    @Min(0) // stop_order có thể bắt đầu từ 0
    @IsNotEmpty()
    stop_order: number;
  
    @IsBoolean()
    @IsOptional()
    is_pickup_point?: boolean = true; // Default value as in schema
  
    @IsBoolean()
    @IsOptional()
    is_dropoff_point?: boolean = true; // Default value as in schema
  
    @IsInt()
    @IsOptional()
    @Type(() => Number) // Ensure it's transformed to a number
    time_offset_minutes?: number = 0; // Default value as in schema
  }