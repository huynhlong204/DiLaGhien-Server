"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripClientModule = void 0;
const common_1 = require("@nestjs/common");
const trip_client_service_1 = require("./trip-client.service");
const trip_client_controller_1 = require("./trip-client.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let TripClientModule = class TripClientModule {
};
exports.TripClientModule = TripClientModule;
exports.TripClientModule = TripClientModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [trip_client_controller_1.TripClientController],
        providers: [trip_client_service_1.TripClientService],
    })
], TripClientModule);
//# sourceMappingURL=trip-client.module.js.map