import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from './entities/chat.entity';
import { UsersModule } from 'src/users/users.module';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/message/message.module'; // ✅ Import MessageModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    forwardRef(() => UsersModule), // ✅ Use forwardRef for UsersModule
    forwardRef(() => MessageModule), // ✅ Use forwardRef for MessageModule
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  exports: [ChatService, MongooseModule,ChatGateway],
})
export class ChatModule {}
