import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}
@Get('personalization/:userId')
async getPersonalizedByBehavior(@Param('userId') userId: string) {
  console.log("🎯 Requête IA reçue pour userId:", userId);
  const recommendations = await this.aiService.getBehaviorBasedRecommendationsv3(userId);
  return {
    success: true,
    recommendations  };
}

@Get('/:userId')
async getPersonalizedByBehaviorv2(@Param('userId') userId: string) {
  const { recommendations, lockedPlaces } = await this.aiService.getBehaviorBasedRecommendationsv3(userId);
  return {
    success: true,
    recommendations,
    lockedPlaces
  };
}
@Get('/filtered-places/:userId')
async getPlacesBySearch(@Param('userId') userId: string) {
  const result = await this.aiService.getFilteredPlacesByUserSearchv2(userId);
  return {
    success: true,
    ...result
  };
}

}
