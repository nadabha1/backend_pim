import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReelService } from './reel.service';
import { ReelController } from './reel.controller';
import { UsersModule } from 'src/users/users.module';
import { ReelMedia, ReelMediaSchema } from './entities/reel.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReelMedia.name, schema: ReelMediaSchema }]),
    forwardRef(() => UsersModule),
  ],
  controllers: [ReelController],
  providers: [ReelService],
  exports: [ReelService, MongooseModule],
})
export class ReelModule {}
