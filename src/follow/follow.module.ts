import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { Follow, FollowSchema } from './entities/follow.entity';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService, MongooseModule],
})
export class FollowModule {}
