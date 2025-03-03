import { Controller, Post, Get, Param, Body } from '@nestjs/common';
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
}
