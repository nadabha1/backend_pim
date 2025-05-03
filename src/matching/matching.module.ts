import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';

// Schémas à importer
import { User, UserSchema } from 'src/users/entities/user.entity';
import { Preference, PreferenceSchema } from 'src/preferences/entities/preference.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Preference', schema: PreferenceSchema },
    ]),
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
