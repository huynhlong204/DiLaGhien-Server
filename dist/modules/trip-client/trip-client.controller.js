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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripClientController = void 0;
const common_1 = require("@nestjs/common");
const trip_client_service_1 = require("./trip-client.service");
let TripClientController = class TripClientController {
    tripClientService;
    constructor(tripClientService) {
        this.tripClientService = tripClientService;
    }
    findAll(query) {
        return this.tripClientService.findAll(query);
    }
    getTripDetailsForBooking(id) {
        return this.tripClientService.getTicketsByTrip(id);
    }
};
exports.TripClientController = TripClientController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [trip_client_service_1.FindTripsQueryDto]),
    __metadata("design:returntype", void 0)
], TripClientController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TripClientController.prototype, "getTripDetailsForBooking", null);
exports.TripClientController = TripClientController = __decorate([
    (0, common_1.Controller)('trip-client'),
    __metadata("design:paramtypes", [trip_client_service_1.TripClientService])
], TripClientController);
//# sourceMappingURL=trip-client.controller.js.map