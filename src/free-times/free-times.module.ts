// free-times.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreeTimeService } from './free-times.service';
import { FreeTimeController } from './free-times.controller';
import { FreeTime, FreeTimeSchema } from './entities/free-time.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FreeTime.name, schema: FreeTimeSchema }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [FreeTimeController],
  providers: [FreeTimeService],
  exports: [FreeTimeService, MongooseModule],
})
export class FreeTimeModule {}
