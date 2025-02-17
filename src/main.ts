import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ Importer NestExpressApplication
import { join } from 'path';

async function bootstrap() {
  //  Spécifier NestExpressApplication pour éviter l'erreur
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //  Active CORS pour les appels API (ex: depuis iOS)
  app.enableCors();

  // Servir les fichiers statiques depuis le dossier 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(3000, '0.0.0.0'); // Écoute sur toutes les interfaces
}
bootstrap();
