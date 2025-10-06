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
exports.SeatLayoutDataDto = exports.FloorDto = exports.SectionDto = exports.SeatDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const SEAT_TYPES = ["standard", "vip", "aisle", "disabled", "empty", "bed", "room", "vip_room", "double_room"];
class SeatDto {
    row;
    col;
    number;
    type;
}
exports.SeatDto = SeatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Row number of the seat', example: 1 }),
    (0, class_validator_1.IsInt)({ message: 'Hàng phải là số nguyên.' }),
    (0, class_validator_1.Min)(1, { message: 'Hàng phải lớn hơn 0.' }),
    __metadata("design:type", Number)
], SeatDto.prototype, "row", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Column number of the seat', example: 1 }),
    (0, class_validator_1.IsInt)({ message: 'Cột phải là số nguyên.' }),
    (0, class_validator_1.Min)(1, { message: 'Cột phải lớn hơn 0.' }),
    __metadata("design:type", Number)
], SeatDto.prototype, "col", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Seat number (e.g., A1, B10)', example: 'A1' }),
    (0, class_validator_1.IsString)({ message: 'Số hiệu ghế phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Số hiệu ghế không được để trống.' }),
    __metadata("design:type", String)
], SeatDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of the seat',
        enum: SEAT_TYPES,
        example: 'standard'
    }),
    (0, class_validator_1.IsEnum)(SEAT_TYPES, { message: 'Loại ghế không hợp lệ.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Loại ghế không được để trống.' }),
    __metadata("design:type", String)
], SeatDto.prototype, "type", void 0);
class SectionDto {
    section_id;
    name;
    rows;
    cols;
    seats;
}
exports.SectionDto = SectionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique ID for the section', example: 'F1S1' }),
    (0, class_validator_1.IsString)({ message: 'ID khu vực phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID khu vực không được để trống.' }),
    __metadata("design:type", String)
], SectionDto.prototype, "section_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the section', example: 'Khu vực Tầng 1' }),
    (0, class_validator_1.IsString)({ message: 'Tên khu vực phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên khu vực không được để trống.' }),
    __metadata("design:type", String)
], SectionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of rows in the section grid', example: 7 }),
    (0, class_validator_1.IsInt)({ message: 'Số hàng phải là số nguyên.' }),
    (0, class_validator_1.Min)(1, { message: 'Số hàng phải lớn hơn 0.' }),
    __metadata("design:type", Number)
], SectionDto.prototype, "rows", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of columns in the section grid', example: 5 }),
    (0, class_validator_1.IsInt)({ message: 'Số cột phải là số nguyên.' }),
    (0, class_validator_1.Min)(1, { message: 'Số cột phải lớn hơn 0.' }),
    __metadata("design:type", Number)
], SectionDto.prototype, "cols", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SeatDto], description: 'List of seats in this section' }),
    (0, class_validator_1.IsArray)({ message: 'Ghế phải là một mảng.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SeatDto),
    __metadata("design:type", Array)
], SectionDto.prototype, "seats", void 0);
class FloorDto {
    floor_number;
    name;
    sections;
}
exports.FloorDto = FloorDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Floor number', example: 1 }),
    (0, class_validator_1.IsInt)({ message: 'Số tầng phải là số nguyên.' }),
    (0, class_validator_1.Min)(1, { message: 'Số tầng phải lớn hơn 0.' }),
    __metadata("design:type", Number)
], FloorDto.prototype, "floor_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the floor', example: 'Tầng 1' }),
    (0, class_validator_1.IsString)({ message: 'Tên tầng phải là chuỗi.' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên tầng không được để trống.' }),
    __metadata("design:type", String)
], FloorDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SectionDto], description: 'List of sections on this floor' }),
    (0, class_validator_1.IsArray)({ message: 'Các khu vực phải là một mảng.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SectionDto),
    __metadata("design:type", Array)
], FloorDto.prototype, "sections", void 0);
class SeatLayoutDataDto {
    total_capacity;
    floors;
}
exports.SeatLayoutDataDto = SeatLayoutDataDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total capacity of seats in the layout', example: 45 }),
    (0, class_validator_1.IsInt)({ message: 'Tổng số ghế phải là số nguyên.' }),
    (0, class_validator_1.Min)(0, { message: 'Tổng số ghế không thể âm.' }),
    __metadata("design:type", Number)
], SeatLayoutDataDto.prototype, "total_capacity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [FloorDto], description: 'List of floors in the seat layout' }),
    (0, class_validator_1.IsArray)({ message: 'Các tầng phải là một mảng.' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FloorDto),
    __metadata("design:type", Array)
], SeatLayoutDataDto.prototype, "floors", void 0);
//# sourceMappingURL=seat-layout.dto.js.map