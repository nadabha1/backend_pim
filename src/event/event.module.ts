import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event,EventSchema } from './entities/event.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationModule } from 'src/conversation/conversation.module';
// import { UsersModule } from './users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  UsersModule,ConversationModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}