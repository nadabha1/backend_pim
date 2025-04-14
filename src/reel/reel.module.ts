import { Module } from '@nestjs/common';
import { ReelService } from './reel.service';
import { ReelController } from './reel.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReelMedia, ReelMediaSchema } from './entities/reel.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: ReelMedia.name, schema: ReelMediaSchema }])],
  controllers: [ReelController],
  providers: [ReelService],
})
export class ReelModule {}
