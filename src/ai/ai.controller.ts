import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('api/ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}
/*
  @Get('/recommendations/:userId')
  async getRecommendations(@Param('userId') userId: string) {
    const recommendations = await this.aiService.getPersonalizedRecommendations(userId);
    return { success: true, recommendations };
  }

*/
}
