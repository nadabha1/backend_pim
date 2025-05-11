import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { NotificationGateway } from './socket.gateway';
import { MessageModule } from 'src/message/message.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    forwardRef(() => MessageModule),
    forwardRef(() => ConversationModule),
    forwardRef(() => UsersModule),
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
  ],
  exports: [
    NotificationService,
    NotificationGateway,
    MongooseModule,
  ],
})
export class NotificationModule {}
