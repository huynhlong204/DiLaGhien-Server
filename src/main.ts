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

  // ✨ Cải tiến: Xử lý origin linh hoạt cho cả dev và production
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://dilaghien.vercel.app/', // Luôn cho phép URL từ .env
    // Thêm các URL khác nếu cần, ví dụ: preview URL của Vercel/Render
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Cho phép các request không có origin (ví dụ: Postman, mobile apps)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Chỉ cần gọi useGlobalPipes một lần
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  // 🧩 Swagger config (Không thay đổi)
  const config = new DocumentBuilder()
    .setTitle('LeafTech API Docs')
    .setDescription('Swagger cho hệ thống NestJS backend')
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' })
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 8000);
  console.log(`🚀 Backend running on port ${process.env.PORT || 8000}`);
  console.log(`📘 Swagger docs available at /api/docs`);
}
bootstrap();