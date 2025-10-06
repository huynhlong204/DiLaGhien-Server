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
exports.CompanyRouteStopsController = void 0;
const common_1 = require("@nestjs/common");
const company_route_stop_service_1 = require("./company-route-stop.service");
const create_company_route_stop_dto_1 = require("./dto/create-company-route-stop.dto");
const update_company_route_stop_dto_1 = require("./dto/update-company-route-stop.dto");
let CompanyRouteStopsController = class CompanyRouteStopsController {
    companyRouteStopsService;
    constructor(companyRouteStopsService) {
        this.companyRouteStopsService = companyRouteStopsService;
    }
    create(createCompanyRouteStopDto) {
        return this.companyRouteStopsService.create(createCompanyRouteStopDto);
    }
    findAll() {
        return this.companyRouteStopsService.findAll();
    }
    findByCompanyRouteId(companyRouteId) {
        return this.companyRouteStopsService.findByCompanyRouteId(companyRouteId);
    }
    findOne(id) {
        return this.companyRouteStopsService.findOne(id);
    }
    update(id, updateCompanyRouteStopDto) {
        return this.companyRouteStopsService.update(id, updateCompanyRouteStopDto);
    }
    remove(id) {
        return this.companyRouteStopsService.remove(id);
    }
};
exports.CompanyRouteStopsController = CompanyRouteStopsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_company_route_stop_dto_1.CreateCompanyRouteStopDto]),
    __metadata("design:returntype", void 0)
], CompanyRouteStopsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompanyRouteStopsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('by-company-route/:companyRouteId'),
    __param(0, (0, common_1.Param)('companyRouteId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompanyRouteStopsController.prototype, "findByCompanyRouteId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompanyRouteStopsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_company_route_stop_dto_1.UpdateCompanyRouteStopDto]),
    __metadata("design:returntype", void 0)
], CompanyRouteStopsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CompanyRouteStopsController.prototype, "remove", null);
exports.CompanyRouteStopsController = CompanyRouteStopsController = __decorate([
    (0, common_1.Controller)('company-route-stops'),
    __metadata("design:paramtypes", [company_route_stop_service_1.CompanyRouteStopsService])
], CompanyRouteStopsController);
//# sourceMappingURL=company-route-stop.controller.js.map