import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { User, UserSchema } from '../users/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}