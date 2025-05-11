import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ Importer NestExpressApplication
import { join } from 'path';
import * as express from 'express';
import * as path from 'path';

// src/main.ts


async function bootstrap() {
  //  Spécifier NestExpressApplication pour éviter l'erreur
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/reels', express.static(path.join(__dirname, '..', 'public', 'reels')));

  //  Active CORS pour les appels API (ex: depuis iOS)
  app.enableCors();

  app.enableCors({
    origin: '*',  // ✅ Autoriser toutes les origines pour les tests
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });
  
  
  
  // Servir les fichiers statiques depuis le dossier 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(3000, '0.0.0.0'); // Écoute sur toutes les interfaces
}
bootstrap();
