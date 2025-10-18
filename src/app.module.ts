import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { VnpayModule } from 'nestjs-vnpay';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

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
import { TripClientModule } from './modules/trip-client/trip-client.module';
import { AuthUserModule } from './modules/auth-user/auth-user.module';
import { CustomersModule } from './modules/customers/customers.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

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

    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.get<string>('REDIS_URL'),
      }),
    }),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Chỉ cần truyền thẳng URL vào đây
        redis: configService.get<string>('REDIS_URL'),
      }),
    }),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: configService.get<string>('MAIL_FROM'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    // Các module khác của bạn
    TripClientModule,
    AuthUserModule,
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