import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Activez cette ligne si vous utilisez des appels API depuis l'application iOS
  await app.listen(3000, '0.0.0.0'); // Écoute sur toutes les interfaces
  }
bootstrap();
