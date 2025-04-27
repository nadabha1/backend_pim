import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Preference.name, schema: PreferenceSchema },
      { name: Carnet.name, schema: CarnetSchema },
      
       // ✅ Add Preference Model
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService,CarnetService,PreferencesService],
  exports: [UsersService,CarnetService,MongooseModule], // Export pour utilisation dans AuthService

})
export class UsersModule {}
