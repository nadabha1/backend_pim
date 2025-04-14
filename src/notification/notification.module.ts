import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { NotificationGateway } from './socket.gateway';
import { MessageModule } from 'src/message/message.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [
    forwardRef(() => MessageModule),
    forwardRef(() => ConversationModule),
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],  // ✅ Ajouter NotificationGateway ici
  exports: [NotificationService, NotificationGateway, MongooseModule], // ✅ ajoute NotificationGateway
})
export class NotificationModule {}
