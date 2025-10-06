import { PartialType } from '@nestjs/swagger';
import { CreateCompanyRouteStopDto } from './create-company-route-stop.dto';

export class UpdateCompanyRouteStopDto extends PartialType(CreateCompanyRouteStopDto) {}
