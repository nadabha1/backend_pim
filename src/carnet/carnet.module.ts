import { forwardRef, Module } from '@nestjs/common';
import { CarnetService } from './carnet.service';
import { CarnetController } from './carnet.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Carnet, CarnetSchema } from './entities/carnet.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports: [forwardRef(() => UsersModule),
    MongooseModule.forFeature([
      { name: Carnet.name, schema: CarnetSchema }, // ✅ Register Carnet Model
      { name: User.name, schema: UserSchema } // ✅ Register User Model (if needed)
    ])
  ],
    controllers: [CarnetController],
  providers: [CarnetService],
  exports: [CarnetService],  // Exporting CarnetService so it can be used elsewhere

})
export class CarnetModule {}
