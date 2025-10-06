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
exports.CreateVehicleTypeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateVehicleTypeDto {
    name;
    description;
}
exports.CreateVehicleTypeDto = CreateVehicleTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tên loại xe (ví dụ: "Xe giường nằm 40 chỗ")',
        example: 'Xe khách 45 chỗ',
    }),
    (0, class_validator_1.IsString)({ message: 'Tên loại xe phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên loại xe không được để trống.' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Tên loại xe không được quá 255 ký tự.' }),
    __metadata("design:type", String)
], CreateVehicleTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mô tả chi tiết về loại xe',
        example: 'Loại xe khách tiêu chuẩn, phù hợp cho các tuyến đường dài.',
        required: false,
    }),
    (0, class_validator_1.IsString)({ message: 'Mô tả phải là chuỗi.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVehicleTypeDto.prototype, "description", void 0);
//# sourceMappingURL=create-vehicle-type.dto.js.map