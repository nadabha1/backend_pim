import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { NotificationGateway } from 'src/notification/socket.gateway';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule,
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]), 
  ],
  controllers: [ConversationController],
  providers: [ConversationService, NotificationGateway], // ✅ Ajout de NotificationGateway
  exports: [ConversationService],
})
export class ConversationModule {}
