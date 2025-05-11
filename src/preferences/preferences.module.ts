import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { Preference, PreferenceSchema } from './entities/preference.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Preference.name, schema: PreferenceSchema }]),
    forwardRef(() => UsersModule), // Wrap UsersModule with forwardRef
  ],
  controllers: [PreferencesController],
  providers: [PreferencesService], // Ensure PreferencesService is provided
  exports: [PreferencesService], // Export PreferencesService
})
export class PreferencesModule {}
