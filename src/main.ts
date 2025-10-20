// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Sử dụng cookie-parser trước cors
  app.use(cookieParser());

  app.enableCors({
    origin: ['https://dilaghien.vercel.app', 'http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['Content-Disposition'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // 🧩 Swagger config
  const config = new DocumentBuilder()
    .setTitle('LeafTech API Docs') // Đặt tên tùy bạn
    .setDescription('Swagger cho hệ thống NestJS backend')
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' }) // Nếu dùng cookie
    .addBearerAuth() // Nếu dùng JWT trong header
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Truy cập tại http://localhost:8000/api/docs

  app.enableShutdownHooks()

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  console.log('SERVER STARTING - JWT_ACCESS_SECRET:', process.env.JWT_SECRET_ADMIN);

  await app.listen(process.env.PORT || 8000);
  console.log(`🚀 Backend running on port ${process.env.PORT || 8000}`);
  console.log(`📘 Swagger docs available at /api/docs`);
}
bootstrap();
