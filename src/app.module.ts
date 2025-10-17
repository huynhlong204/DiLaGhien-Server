import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './modules/role/role.module';
import { ModuleModule } from './modules/module/module.module';
import { PermissionModule } from './modules/permission/permission.module';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { RoleModulePermissionsModule } from './modules/role-module-permissions/role-module-permissions.module';
import { RouteModule } from './modules/route/route.module';
import { LocationModule } from './modules/location/location.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { VehicleTypesModule } from './modules/vehicle-types/vehicle-types.module';
import { SeatLayoutTemplatesModule } from './modules/seat-layout-templates/seat-layout-templates.module';
import { TripsModule } from './modules/trips/trips.module';
import { CompanyRouteStopModule } from './modules/company-route-stop/company-route-stop.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TripClientModule } from './modules/trip-client/trip-client.module';
import { AuthUserModule } from './modules/auth-user/auth-user.module';
import { CustomersModule } from './modules/customers/customers.module';
import { VnpayModule } from 'nestjs-vnpay';
import { PaymentModule } from './payment/payment.module';
import { ignoreLogger } from 'vnpay';

@Module({
  imports: [
    // VnpayModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     tmnCode: configService.get<string>('VNP_TMN_CODE')!,
    //     secureSecret: configService.get<string>('VNP_HASH_SECRET')!,
    //     returnUrl: configService.get<string>('VNP_RETURN_URL')!,
    //     vnpayHost: 'https://sandbox.vnpayment.vn',
    //     secure: true,
    //   }),
    // }),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', }),
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        tmnCode: configService.get('VNP_TMN_CODE')!,
        secureSecret: configService.get('VNP_HASH_SECRET')!,
        vnpayHost: 'https://sandbox.vnpayment.vn',
        secure: true,
      }),
    }),
    RedisModule.forRoot({
      type: 'single',
      url: 'rediss://default:ARzwAAImcDJlNDczYjU3M2FmZmU0OWE1OGI4NmUxYWFjOGVkNjYzOHAyNzQwOA@teaching-loon-7408.upstash.io:6379',
    }), TripClientModule, AuthUserModule,

    CustomersModule,
    PrismaModule,
    AuthModule,
    RoleModule,
    ModuleModule,
    PermissionModule,
    CompanyModule,
    UserModule,
    RoleModulePermissionsModule,
    RouteModule,
    LocationModule,
    VehiclesModule,
    VehicleTypesModule,
    SeatLayoutTemplatesModule,
    TripsModule,
    CompanyRouteStopModule,
    TicketsModule,

    PaymentModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
