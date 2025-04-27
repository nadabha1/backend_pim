import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';
import { UserEvent, UserEventSchema } from './entities/user-event.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserEvent.name, schema: UserEventSchema }]), // Ajoute le modèle ici
  ],
  providers: [UserEventService],
  controllers: [UserEventController],
})
export class UserEventModule {}
