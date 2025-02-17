import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { CarnetModule } from 'src/carnet/carnet.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),CarnetModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export pour utilisation dans AuthService

})
export class UsersModule {}
