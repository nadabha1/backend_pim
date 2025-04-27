// free-times.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FreeTimeService } from './free-times.service';
import { FreeTimeController } from './free-times.controller';
import { FreeTime, FreeTimeSchema } from './entities/free-time.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FreeTime.name, schema: FreeTimeSchema }]),
  ],
  controllers: [FreeTimeController],
  providers: [FreeTimeService],
  exports: [FreeTimeService], 
})
export class FreeTimeModule {}
