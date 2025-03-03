import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Messages, MessagesSchema } from './entities/messages.entity';
import { EventModule } from 'src/event/event.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ChatGateway } from 'src/chat.gateway';


@Module({
  imports: [
     // Replace with your MongoDB URI
    MongooseModule.forFeature([{ name: Messages.name, schema: MessagesSchema }]),
    EventModule,
  ],
  controllers: [MessagesController],
  providers: [ChatGateway, MessagesService],
})
export class MessagesModule {}