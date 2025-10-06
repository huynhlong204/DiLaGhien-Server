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
exports.UpdateSeatLayoutTemplateDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_seat_layout_template_dto_1 = require("./create-seat-layout-template.dto");
const swagger_2 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const seat_layout_dto_1 = require("./seat-layout.dto");
class UpdateSeatLayoutTemplateDto extends (0, swagger_1.PartialType)(create_seat_layout_template_dto_1.CreateSeatLayoutTemplateDto) {
    layout_data;
}
exports.UpdateSeatLayoutTemplateDto = UpdateSeatLayoutTemplateDto;
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        description: 'Dữ liệu chi tiết về sơ đồ ghế (cấu trúc JSON)',
        type: seat_layout_dto_1.SeatLayoutDataDto,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => seat_layout_dto_1.SeatLayoutDataDto),
    __metadata("design:type", seat_layout_dto_1.SeatLayoutDataDto)
], UpdateSeatLayoutTemplateDto.prototype, "layout_data", void 0);
//# sourceMappingURL=update-seat-layout-template.dto.js.map