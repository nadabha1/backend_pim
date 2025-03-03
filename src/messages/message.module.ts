import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { EventModule } from 'src/event/event.module';
import { MessageController } from './message.controller';
import { ChatGateway } from 'src/chat.gateway';
import { MessageService } from './message.service';


@Module({
  imports: [
     // Replace with your MongoDB URI
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    EventModule,
  ],
  controllers: [MessageController],
  providers: [ChatGateway, MessageService],
})
export class MessageModule {}