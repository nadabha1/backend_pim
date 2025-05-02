import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review, ReviewSchema } from './entities/review.entity';
import { Carnet, CarnetSchema, Place } from 'src/carnet/entities/carnet.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Place.name, schema: CarnetSchema },
      { name: Carnet.name, schema: CarnetSchema },
      { name: User.name, schema: UserSchema }, // 👈 Add User model
    ]),
    forwardRef(() => UsersModule), // ✅ Use forwardRef to resolve circular dependency
  ],
  providers: [ReviewService], // ✅ Provide ReviewService
  controllers: [ReviewController],
  exports: [ReviewService], // ✅ Export ReviewService for use in other modules
})
export class ReviewModule {}
