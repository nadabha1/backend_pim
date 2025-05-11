import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './entities/review.entity';
import { Carnet, CarnetDocument, Place } from 'src/carnet/entities/carnet.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Carnet.name) private carnetModel: Model<CarnetDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Ajouter un avis pour un lieu
  async addReview(placeId: string, userId: string, rating: number, comment?: string) {
    console.log(`Adding review for placeId: ${placeId} by userId: ${userId}`);

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await this.reviewModel.findOne({ placeId, userId });
    if (existingReview) {
      throw new BadRequestException('User has already reviewed this place');
    }

    // Créer et sauvegarder l'avis
    const review = new this.reviewModel({ placeId, userId, rating, comment });
    await review.save();

    console.log('Review added:', review);

    // Mettre à jour la moyenne des notes du lieu et du carnet
    await this.updatePlaceRating(placeId);

    // Récompenser l'utilisateur avec 2 coins
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.coins += 2;
      await user.save();
      console.log(`User ${userId} rewarded with 2 coins. New balance: ${user.coins}`);
    } catch (error) {
      console.error('Error updating coins:', error);
    }

    return review;
  }

  // Calculer la moyenne des notes pour un lieu
  async calculateAverageRating(placeId: string): Promise<number> {
    console.log(`Calculating average rating for placeId: ${placeId}`);

    const reviews = await this.reviewModel.find({ placeId });

    console.log(`Fetched ${reviews.length} reviews for placeId: ${placeId}`);

    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    console.log(`New calculated average rating for placeId ${placeId}: ${averageRating}`);

    return averageRating;
  }

  // Mettre à jour la moyenne de notation d'un lieu et du carnet
  async updatePlaceRating(placeId: string) {
    console.log(`Updating average rating for placeId: ${placeId}`);

    // Trouver le carnet contenant la place
    const carnet = await this.carnetModel.findOne({ "places._id": new Types.ObjectId(placeId) }).exec();

    if (!carnet) {
      console.error(`Carnet with placeId ${placeId} not found`);
      return;
    }

    // Trouver la place dans le carnet
    const placeIndex = carnet.places.findIndex(place => place._id.toString() === placeId);
    if (placeIndex === -1) {
      console.error(`Place ${placeId} not found in carnet`);
      return;
    }

    // Calculer la nouvelle moyenne des avis pour la place
    const averageRating = await this.calculateAverageRating(placeId);

    // Mettre à jour la place avec la nouvelle moyenne
    carnet.places[placeIndex].averageRating = averageRating;

    // Mettre à jour la moyenne globale du carnet
    carnet.globalAverageRating = this.calculateGlobalAverageRating(carnet);

    // Sauvegarder le carnet mis à jour
    await carnet.save();

    console.log(`✅ Place ${placeId} updated with new average rating: ${averageRating}`);
    console.log(`✅ Carnet ${carnet._id} updated with new global average rating: ${carnet.globalAverageRating}`);
  }

  // Calculer la moyenne globale des ratings d’un carnet
  calculateGlobalAverageRating(carnet: CarnetDocument): number {
    if (!carnet.places || carnet.places.length === 0) return 0;

    const totalRating = carnet.places.reduce((sum, place) => sum + place.averageRating, 0);
    const globalAverage = totalRating / carnet.places.length;

    console.log(`Calculated global average rating for carnet ${carnet._id}: ${globalAverage}`);

    return globalAverage;
  }

  // Obtenir tous les avis pour un lieu
  async getReviews(placeId: string) {
    console.log(`Fetching reviews for placeId: ${placeId}`);
    const reviews = await this.reviewModel.find({ placeId }).populate('userId', 'username');
    console.log(`Reviews found: ${reviews.length}`, reviews);
    return reviews;
  }

  // Obtenir la note moyenne d’un lieu
  async getAverageRating(placeId: string): Promise<number> {
    return this.calculateAverageRating(placeId);
  }

  // Obtenir la note globale d’un carnet
  async getGlobalAverageRating(carnetId: string): Promise<number> {
    const carnet = await this.carnetModel.findById(carnetId);
    if (!carnet) {
      throw new NotFoundException('Carnet not found');
    }
    return this.calculateGlobalAverageRating(carnet);
  }

  // Modifier un avis existant
  async editReview(placeId: string, userId: string, rating: number, comment?: string) {
    console.log(`Editing review for placeId: ${placeId} by userId: ${userId}`);

    const review = await this.reviewModel.findOne({ placeId, userId });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.rating = rating;
    review.comment = comment ?? review.comment; // garde l'ancien commentaire si aucun n'est fourni
    await review.save();

    console.log('Review updated:', review);

    // Mettre à jour la moyenne des notes
    await this.updatePlaceRating(placeId);

    return review;
  }

  // ✅ Supprimer tous les avis d'un utilisateur
  async deleteReviewsByUser(userId: string): Promise<void> {
    console.log(`Deleting reviews for userId: ${userId}`);
    await this.reviewModel.deleteMany({ userId });
    console.log(`✅ Reviews for userId ${userId} deleted successfully`);
  }
}
