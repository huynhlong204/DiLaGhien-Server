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

  app.use(cookieParser());

  // ✅ Danh sách origin cho phép (bỏ dấu / ở cuối URL)
  const allowedOrigins = [
    'https://dilaghien.vercel.app',
    'http://localhost:3000', // cho dev local
  ];

  // ✅ Bật CORS chuẩn cho cookie cross-site
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // cần để gửi cookie
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ Prefix cho API
  app.setGlobalPrefix('api');

  // ✅ Validation global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Swagger config
  const config = new DocumentBuilder()
    .setTitle('LeafTech API Docs')
    .setDescription('Swagger cho hệ thống NestJS backend')
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' })
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
  console.log(`📘 Swagger docs available at /api/docs`);
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
