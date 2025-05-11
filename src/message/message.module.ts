import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UsersModule } from 'src/users/users.module';
import { ChatModule } from 'src/chat/chat.module';
import { ChatGateway } from 'src/chat/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    forwardRef(() => ChatModule),
    forwardRef(() => ConversationModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [MessageController],
  providers: [MessageService,ChatGateway],
  exports: [MessageService, MongooseModule],
})
export class MessageModule {}
