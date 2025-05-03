import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { CarnetModule } from 'src/carnet/carnet.module';
import { PreferencesModule } from 'src/preferences/preferences.module';
import { CarnetService } from 'src/carnet/carnet.service';
import { Preference, PreferenceSchema } from 'src/preferences/entities/preference.entity';
import { Carnet, CarnetSchema } from 'src/carnet/entities/carnet.entity';
import { PreferencesService } from 'src/preferences/preferences.service';
import { EventModule } from 'src/event/event.module'; // ✅ Ensure EventModule is imported
import { EventService } from 'src/event/event.service'; // ✅ Import EventService
import { ChatModule } from 'src/chat/chat.module'; // ✅ Import ChatModule
import { ChatService } from 'src/chat/chat.service'; // ✅ Import ChatService
import { ConversationModule } from 'src/conversation/conversation.module'; // ✅ Import ConversationModule
import { ConversationService } from 'src/conversation/conversation.service'; // ✅ Import ConversationService
import { FollowModule } from 'src/follow/follow.module'; // ✅ Import FollowModule
import { FollowService } from 'src/follow/follow.service'; // ✅ Import FollowService
import { FreeTimeModule } from 'src/free-times/free-times.module'; // ✅ Import FreeTimeModule
import { FreeTimeService } from 'src/free-times/free-times.service'; // ✅ Import FreeTimeService
import { MessageModule } from 'src/message/message.module'; // ✅ Import MessageModule
import { NotificationModule } from 'src/notification/notification.module'; // ✅ Ensure NotificationModule is imported
import { NotificationService } from 'src/notification/notification.service'; // ✅ Import NotificationService
import { ReelModule } from 'src/reel/reel.module'; // ✅ Import ReelModule
import { ReelService } from 'src/reel/reel.service'; // ✅ Import ReelService
import { ReviewModule } from 'src/review/review.module'; // ✅ Import ReviewModule
import { TripModule } from 'src/trip/trip.module'; // ✅ Import TripModule
import { UserEventModule } from 'src/user-event/user-event.module'; // ✅ Import UserEventModule
import { MessageService } from 'src/message/message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Carnet.name, schema: CarnetSchema },
    ]),
    forwardRef(() => EventModule), // ✅ Wrap EventModule with forwardRef
    ChatModule,
    forwardRef(() => ConversationModule), // ✅ Wrap ConversationModule with forwardRef
    forwardRef(() => FollowModule), // ✅ Wrap FollowModule with forwardRef
    forwardRef(() => FreeTimeModule), // ✅ Add FreeTimeModule to resolve FreeTimeModel
    forwardRef(() => MessageModule), // ✅ Add MessageModule to resolve MessageModel
    forwardRef(() => NotificationModule), // ✅ Wrap NotificationModule with forwardRef
    forwardRef(() => ReelModule), // ✅ Add ReelModule to resolve ReelMediaModel
    forwardRef(() => PreferencesModule), // ✅ Wrap PreferencesModule with forwardRef
    forwardRef(() => ReviewModule), // ✅ Add ReviewModule to resolve ReviewService
    forwardRef(() => TripModule), // ✅ Add TripModule to resolve TripService
    forwardRef(() => UserEventModule), // ✅ Add UserEventModule to resolve UserEventService
  ],
  controllers: [UsersController],
  providers: [
    UsersService, // ✅ Ensure UsersService is provided
    CarnetService,
    PreferencesService,
    EventService,
    ChatService,
    ConversationService,
    FollowService,
    FreeTimeService,
    MessageService,
    NotificationService,
    ReelService,
  ],
  exports: [
    UsersService, // ✅ Ensure UsersService is exported
    CarnetService,
    MongooseModule,
  ],
})
export class UsersModule {}
