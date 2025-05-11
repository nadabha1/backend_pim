import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { User, UserSchema } from '../users/entities/user.entity';
import { TripReminderService } from './trip_reminder.service';
import { Trip, TripSchema } from './entities/trip.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { Notification ,NotificationSchema } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Trip.name, schema: TripSchema }, // ✅ ajoute ce modèle ici
      { name: Notification.name , schema: NotificationSchema}
    ]),
    forwardRef(() => NotificationModule)
  ],
  controllers: [TripController],
  providers: [TripService , TripReminderService , NotificationService],
  exports: [TripService] // ✅ Export TripService for use in other modules
})
export class TripModule {}