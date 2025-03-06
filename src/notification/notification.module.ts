import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { NotificationGateway } from './socket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]), // ✅ Ajoute ceci
  ],
  controllers: [NotificationController],
  providers: [NotificationService,NotificationGateway],
  exports: [NotificationService], // ✅ Ajoute ceci si nécessaire
})
export class NotificationModule {}
