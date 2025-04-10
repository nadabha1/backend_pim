import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { Follow,FollowSchema } from './entities/follow.entity';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Follow.name, schema: FollowSchema },
      { name: User.name, schema: UserSchema }, // ✅ Ajout du modèle User ici
      
    ])
  ,UsersModule,        
  forwardRef(() => NotificationModule),  // ✅ Utiliser forwardRef
],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService], // 👈 Exporter pour d'autres modules
})
export class FollowModule {}
