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
exports.FindTripsQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class FindTripsQueryDto {
    companyRouteId;
    date;
}
exports.FindTripsQueryDto = FindTripsQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'ID tuyến đường của công ty' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'companyRouteId phải là số nguyên' }),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], FindTripsQueryDto.prototype, "companyRouteId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-07-20', description: 'Ngày khởi hành (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)({}, { message: 'date phải là chuỗi ngày hợp lệ định dạng ISO (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], FindTripsQueryDto.prototype, "date", void 0);
//# sourceMappingURL=byRouteDate.dto.js.map