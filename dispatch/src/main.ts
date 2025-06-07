import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const whiteList = [
    'https://forum-blog-website.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.1:3000',
  ];

  app.enableCors({
    origin: whiteList,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, Expires, Cache-Control, Pragma, X-Requested-With, ngrok-skip-browser-warning',
  });

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(process.env.PORT || 3001); // Use || for cleaner default port
}

bootstrap();