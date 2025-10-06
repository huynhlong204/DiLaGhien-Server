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
exports.CreateTripDto = void 0;
const class_validator_1 = require("class-validator");
const trip_status_enum_1 = require("../enums/trip-status.enum");
const swagger_1 = require("@nestjs/swagger");
class CreateTripDto {
    company_route_id;
    vehicle_id;
    departure_time;
    price_default;
    status = trip_status_enum_1.TripStatus.SCHEDULED;
    seat_layout_templatesId;
    driver_id;
    vehicle_type_id;
}
exports.CreateTripDto = CreateTripDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của liên kết công ty-tuyến đường (company_routes) mà chuyến đi này sẽ đi theo. Đây là ID từ bảng company_routes.',
        example: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateTripDto.prototype, "company_route_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của phương tiện được gán cho chuyến đi (tùy chọn).',
        example: 101,
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreateTripDto.prototype, "vehicle_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thời gian khởi hành của chuyến đi (định dạng ISO 8601 string).',
        example: '2025-07-15T10:00:00Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTripDto.prototype, "departure_time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Giá vé mặc định cho chuyến đi.',
        example: 150000.00,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateTripDto.prototype, "price_default", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Trạng thái ban đầu của chuyến đi (mặc định là "scheduled").',
        enum: trip_status_enum_1.TripStatus,
        example: trip_status_enum_1.TripStatus.SCHEDULED,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(trip_status_enum_1.TripStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTripDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của mẫu bố trí ghế được sử dụng cho chuyến đi (tùy chọn).',
        example: 1,
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreateTripDto.prototype, "seat_layout_templatesId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của tài xế được gán cho chuyến đi (tùy chọn).',
        example: 201,
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreateTripDto.prototype, "driver_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của loại phương tiện (tùy chọn).',
        example: 301,
        required: false,
        nullable: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Object)
], CreateTripDto.prototype, "vehicle_type_id", void 0);
//# sourceMappingURL=create-trip.dto.js.map