"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeatLayoutTemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const seat_layout_templates_controller_1 = require("./seat-layout-templates.controller");
const seat_layout_templates_service_1 = require("./seat-layout-templates.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let SeatLayoutTemplatesModule = class SeatLayoutTemplatesModule {
};
exports.SeatLayoutTemplatesModule = SeatLayoutTemplatesModule;
exports.SeatLayoutTemplatesModule = SeatLayoutTemplatesModule = __decorate([
    (0, common_1.Module)({
        controllers: [seat_layout_templates_controller_1.SeatLayoutTemplatesController],
        providers: [seat_layout_templates_service_1.SeatLayoutTemplatesService, prisma_service_1.PrismaService],
        exports: [seat_layout_templates_service_1.SeatLayoutTemplatesService],
    })
], SeatLayoutTemplatesModule);
//# sourceMappingURL=seat-layout-templates.module.js.map