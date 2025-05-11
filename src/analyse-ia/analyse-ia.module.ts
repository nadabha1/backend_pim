import { Module } from '@nestjs/common';
import { AnalyseIaService } from './analyse-ia.service';
import { AnalyseIaController } from './analyse-ia.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserActivity, UserActivitySchema } from './entities/user-activity.entity.ts';
import { Preference, PreferenceSchema } from 'src/preferences/entities/preference.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: UserActivity.name, schema: UserActivitySchema },
      { name: Preference.name, schema: PreferenceSchema },
    ]),
  ],
  controllers: [AnalyseIaController],
  providers: [AnalyseIaService],
})
export class AnalyseIaModule {}
