import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(join(__dirname, 'uploads')));

  await app.listen(3000, '0.0.0.0');

  app.enableCors({
    origin: '*',  // ✅ Autoriser toutes les origines pour les tests
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });
  
  
}
bootstrap();
