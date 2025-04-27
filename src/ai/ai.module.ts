import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { CarnetModule } from 'src/carnet/carnet.module';
import { Carnet, CarnetSchema } from 'src/carnet/entities/carnet.entity';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => CarnetModule),  // ➤ Importe CarnetModule avec forwardRef
    UsersModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Carnet.name, schema: CarnetSchema }  // ➤ Enregistre le modèle Carnet ici
    ])
  ],
  providers: [AIService],
  controllers: [AIController]
})
export class AiModule {}
