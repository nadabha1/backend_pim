import { Module, forwardRef } from '@nestjs/common';
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
import { TripService } from 'src/trip/trip.service';
import { Trip, TripSchema } from 'src/trip/entities/trip.entity';
import { NotificationModule } from 'src/notification/notification.module'; // 🟢 Importer le NotificationModule ici

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Carnet.name, schema: CarnetSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    forwardRef(() => NotificationModule), // 🟢 Ajouter ici pour que UsersModule connaisse NotificationService
  ],
  controllers: [UsersController],
  providers: [UsersService, CarnetService, PreferencesService, TripService],
  exports: [UsersService, CarnetService, MongooseModule, TripService],
})
export class UsersModule {}
