import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event, EventSchema } from './entities/event.entity';
import { UsersModule } from 'src/users/users.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FreeTimeModule } from 'src/free-times/free-times.module';
import { PreferencesModule } from 'src/preferences/preferences.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]), // ✅ Register EventModel
    forwardRef(() => UsersModule), // ✅ Import UsersModule to resolve dependencies
    forwardRef(() => ConversationModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => FreeTimeModule),
    forwardRef(() => PreferencesModule),
  ],
  controllers: [EventController],
  providers: [EventService], // ✅ Provide EventService
  exports: [EventService, MongooseModule], // ✅ Export EventService and MongooseModule
})
export class EventModule {}