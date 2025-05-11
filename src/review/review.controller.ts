import { Controller, Post, Get, Param, Body, Put } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':placeId')
  async addReview(
    @Param('placeId') placeId: string,
    @Body() reviewData: { userId: string; rating: number; comment?: string }
  ) {
    return this.reviewService.addReview(placeId, reviewData.userId, reviewData.rating, reviewData.comment);
  }

  @Get(':placeId')
  async getReviews(@Param('placeId') placeId: string) {
    return this.reviewService.getReviews(placeId);
  }
  @Get(':placeId/average-rating')
async getAverageRating(@Param('placeId') placeId: string) {
  return this.reviewService.getAverageRating(placeId);
}

@Get('/carnet/:carnetId/global-average-rating')
async getGlobalAverageRating(@Param('carnetId') carnetId: string) {
  return this.reviewService.getGlobalAverageRating(carnetId);
}

@Put(':placeId')
async updateReview(
  @Param('placeId') placeId: string,
  @Body('userId') userId: string,
  @Body('rating') rating: number,
  @Body('comment') comment?: string,
) {
  return this.reviewService.editReview(placeId, userId, rating, comment);
}

}
