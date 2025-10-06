import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.use(cookieParser());

  // Danh sách origin cho phép (chuẩn hóa không có dấu '/')
  const allowedOrigins = [
    'https://dilaghien.vercel.app',
    'http://localhost:3000',
  ];

  // Cấu hình CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Cho phép Postman/Swagger
      const normalized = origin.replace(/\/$/, ''); // bỏ dấu /
      if (allowedOrigins.includes(normalized)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('LeafTech API Docs')
    .setDescription('Swagger cho hệ thống NestJS backend')
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
