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
exports.CreateSeatLayoutTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const seat_layout_dto_1 = require("./seat-layout.dto");
class CreateSeatLayoutTemplateDto {
    name;
    seat_count;
    description;
    layout_data;
}
exports.CreateSeatLayoutTemplateDto = CreateSeatLayoutTemplateDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tên sơ đồ ghế',
        example: 'Sơ đồ xe 45 chỗ',
    }),
    (0, class_validator_1.IsString)({ message: 'Tên sơ đồ ghế phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên sơ đồ ghế không được để trống.' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Tên sơ đồ ghế không được quá 255 ký tự.' }),
    __metadata("design:type", String)
], CreateSeatLayoutTemplateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tổng số ghế trong sơ đồ',
        example: 45,
    }),
    (0, class_validator_1.IsInt)({ message: 'Số lượng ghế phải là số nguyên.' }),
    (0, class_validator_1.Min)(1, { message: 'Số lượng ghế phải lớn hơn 0.' }),
    __metadata("design:type", Number)
], CreateSeatLayoutTemplateDto.prototype, "seat_count", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mô tả chi tiết về sơ đồ ghế',
        example: 'Sơ đồ ghế tiêu chuẩn cho xe khách 45 chỗ.',
        required: false,
    }),
    (0, class_validator_1.IsString)({ message: 'Mô tả phải là chuỗi.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSeatLayoutTemplateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dữ liệu chi tiết về sơ đồ ghế (cấu trúc JSON)',
        type: seat_layout_dto_1.SeatLayoutDataDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => seat_layout_dto_1.SeatLayoutDataDto),
    (0, class_validator_1.IsNotEmpty)({ message: 'Dữ liệu sơ đồ ghế không được để trống.' }),
    __metadata("design:type", seat_layout_dto_1.SeatLayoutDataDto)
], CreateSeatLayoutTemplateDto.prototype, "layout_data", void 0);
//# sourceMappingURL=create-seat-layout-template.dto.js.map