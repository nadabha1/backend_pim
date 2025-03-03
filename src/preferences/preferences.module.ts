import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';
import { Preference, PreferenceSchema } from './entities/preference.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Preference.name, schema: PreferenceSchema }]),
  ],
  controllers: [PreferencesController],
  providers: [PreferencesService],
  exports: [PreferencesService],  // si vous voulez exporter le service pour une utilisation dans d'autres modules
})
export class PreferencesModule {}
