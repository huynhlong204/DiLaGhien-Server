"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const role_module_1 = require("./modules/role/role.module");
const module_module_1 = require("./modules/module/module.module");
const permission_module_1 = require("./modules/permission/permission.module");
const company_module_1 = require("./modules/company/company.module");
const user_module_1 = require("./modules/user/user.module");
const role_module_permissions_module_1 = require("./modules/role-module-permissions/role-module-permissions.module");
const route_module_1 = require("./modules/route/route.module");
const location_module_1 = require("./modules/location/location.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
const vehicle_types_module_1 = require("./modules/vehicle-types/vehicle-types.module");
const seat_layout_templates_module_1 = require("./modules/seat-layout-templates/seat-layout-templates.module");
const trips_module_1 = require("./modules/trips/trips.module");
const company_route_stop_module_1 = require("./modules/company-route-stop/company-route-stop.module");
const tickets_module_1 = require("./modules/tickets/tickets.module");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("@nestjs-modules/ioredis");
const trip_client_module_1 = require("./modules/trip-client/trip-client.module");
const auth_user_module_1 = require("./modules/auth-user/auth-user.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            role_module_1.RoleModule,
            module_module_1.ModuleModule,
            permission_module_1.PermissionModule,
            company_module_1.CompanyModule,
            user_module_1.UserModule,
            role_module_permissions_module_1.RoleModulePermissionsModule,
            route_module_1.RouteModule,
            location_module_1.LocationModule,
            vehicles_module_1.VehiclesModule,
            vehicle_types_module_1.VehicleTypesModule,
            seat_layout_templates_module_1.SeatLayoutTemplatesModule,
            trips_module_1.TripsModule,
            company_route_stop_module_1.CompanyRouteStopModule,
            tickets_module_1.TicketsModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            ioredis_1.RedisModule.forRoot({
                type: 'single',
                url: 'redis://localhost:6379',
            }), trip_client_module_1.TripClientModule, auth_user_module_1.AuthUserModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map