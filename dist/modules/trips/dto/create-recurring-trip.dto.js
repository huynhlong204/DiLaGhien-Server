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
exports.CreateRecurringTripDto = void 0;
const class_validator_1 = require("class-validator");
const create_trip_dto_1 = require("./create-trip.dto");
const swagger_1 = require("@nestjs/swagger");
class CreateRecurringTripDto extends create_trip_dto_1.CreateTripDto {
    recurrenceDays;
}
exports.CreateRecurringTripDto = CreateRecurringTripDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 7,
        description: 'Số ngày liên tiếp tạo chuyến đi (ví dụ: 7 để tạo 7 chuyến đi hàng ngày).',
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateRecurringTripDto.prototype, "recurrenceDays", void 0);
//# sourceMappingURL=create-recurring-trip.dto.js.map