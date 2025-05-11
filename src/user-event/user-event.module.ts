import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';
import { UserEvent, UserEventSchema } from './entities/user-event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEvent.name, schema: UserEventSchema }]), // ✅ Register UserEventModel
  ],
  controllers: [UserEventController],
  providers: [UserEventService], // ✅ Provide UserEventService
  exports: [UserEventService], // ✅ Export UserEventService for use in other modules
})
export class UserEventModule {}
