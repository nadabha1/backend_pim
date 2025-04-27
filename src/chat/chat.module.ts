import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from '../message/message.module';  // ✅ Chemin correct
import { ChatService } from './chat.service';

@Module({
  imports: [MessageModule],         // ✅ Assure-toi que MessageModule est importé
  providers: [ChatGateway, ChatService],  // ✅ Fournir ChatGateway et ChatService
})
export class ChatModule {}
