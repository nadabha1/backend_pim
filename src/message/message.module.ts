import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [
    ConversationModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],  // ✅ Assure-toi que c'est exporté ici
})
export class MessageModule {}
