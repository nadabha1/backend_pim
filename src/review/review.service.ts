import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CarnetDocument, Place } from 'src/carnet/entities/carnet.entity';
import { Review, ReviewDocument } from './entities/review.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Place.name) private placeModel: Model<CarnetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async addReview(placeId: string, userId: string, rating: number, comment?: string) {
    // Vérifier si l'utilisateur a déjà laissé une revue pour ce lieu
    const existingReview = await this.reviewModel.findOne({ placeId, userId });
    if (existingReview) {
      throw new Error('User has already reviewed this place');
    }

    // Créer la revue
    const review = new this.reviewModel({ placeId, userId, rating, comment });
    await review.save();

    // Mettre à jour la moyenne des notes du lieu
    const result = await this.reviewModel.aggregate([
      { $match: { placeId } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } },
    ]);

    if (result.length > 0) {
      const averageRating = result[0].averageRating;
      await this.placeModel.findByIdAndUpdate(placeId, { averageRating });
    }

    // Récompenser l'utilisateur avec 2 coins
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Log the current user data
      console.log('User before coin update:', user);

      user.coins += 2; // Ajoute 2 coins
      await user.save(); // Sauvegarder l'utilisateur avec les coins mis à jour

      // Log the updated user data
      console.log('User after coin update:', user);
    } catch (error) {
      console.error('Error updating coins:', error);
    }

    return review;
  }

  async getReviews(placeId: string) {
    return this.reviewModel.find({ placeId }).populate('userId', 'username');
  }
}
