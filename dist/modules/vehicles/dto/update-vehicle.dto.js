"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVehicleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_vehicle_dto_1 = require("./create-vehicle.dto");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class UpdateVehicleDto extends (0, swagger_1.PartialType)(create_vehicle_dto_1.CreateVehicleDto) {
    plate_number;
    brand;
    status;
    vehicle_type_id;
    seat_layout_template_id;
}
exports.UpdateVehicleDto = UpdateVehicleDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Biển số xe',
        example: '51F-123.45',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Biển số xe phải là chuỗi.' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Biển số xe không được quá 50 ký tự.' }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "plate_number", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Hãng xe',
        example: 'Hyundai',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Hãng xe phải là chuỗi.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Hãng xe không được quá 100 ký tự.' }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Trạng thái xe (active, maintenance, inactive)',
        example: 'maintenance',
        enum: ['active', 'maintenance', 'inactive'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Trạng thái xe phải là chuỗi.' }),
    (0, class_validator_1.IsIn)(['active', 'maintenance', 'inactive'], { message: 'Trạng thái xe không hợp lệ.' }),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'ID của loại xe (từ vehicle_types)',
        example: 2,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'ID loại xe phải là số nguyên.' }),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "vehicle_type_id", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'ID của sơ đồ ghế (từ seat_layout_templates)',
        example: 2,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'ID sơ đồ ghế phải là số nguyên.' }),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "seat_layout_template_id", void 0);
//# sourceMappingURL=update-vehicle.dto.js.map