import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event,EventSchema } from './entities/event.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FreeTime, FreeTimeSchema } from 'src/free-times/entities/free-time.entity';
import { FreeTimeModule } from 'src/free-times/free-times.module';
// import { UsersModule } from './users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }, 
  ]),
  FreeTimeModule,
  UsersModule,ConversationModule,    
  forwardRef(() => NotificationModule),  // ✅ Utiliser forwardRef
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService], // ✅ exporter le service ici

})
export class EventModule {}