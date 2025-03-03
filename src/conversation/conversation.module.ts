import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]), // Enregistre le modèle
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService], // Si tu veux utiliser ce service ailleurs
})
export class ConversationModule {}
