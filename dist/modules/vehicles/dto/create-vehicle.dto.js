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
exports.CreateVehicleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateVehicleDto {
    plate_number;
    brand;
    status = 'active';
    vehicle_type_id;
    seat_layout_template_id;
}
exports.CreateVehicleDto = CreateVehicleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Biển số xe',
        example: '51F-123.45',
    }),
    (0, class_validator_1.IsString)({ message: 'Biển số xe phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Biển số xe không được để trống.' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Biển số xe không được quá 50 ký tự.' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "plate_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hãng xe',
        example: 'Hyundai',
    }),
    (0, class_validator_1.IsString)({ message: 'Hãng xe phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Hãng xe không được để trống.' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Hãng xe không được quá 100 ký tự.' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trạng thái xe (active, maintenance, inactive)',
        example: 'active',
        required: false,
        enum: ['active', 'maintenance', 'inactive'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Trạng thái xe phải là chuỗi.' }),
    (0, class_validator_1.IsIn)(['active', 'maintenance', 'inactive'], { message: 'Trạng thái xe không hợp lệ.' }),
    __metadata("design:type", String)
], CreateVehicleDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của loại xe (từ vehicle_types)',
        example: 1,
    }),
    (0, class_validator_1.IsInt)({ message: 'ID loại xe phải là số nguyên.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID loại xe không được để trống.' }),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "vehicle_type_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của sơ đồ ghế (từ seat_layout_templates)',
        example: 1,
    }),
    (0, class_validator_1.IsInt)({ message: 'ID sơ đồ ghế phải là số nguyên.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID sơ đồ ghế không được để trống.' }),
    __metadata("design:type", Number)
], CreateVehicleDto.prototype, "seat_layout_template_id", void 0);
//# sourceMappingURL=create-vehicle.dto.js.map