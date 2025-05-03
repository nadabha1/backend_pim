import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Res } from '@nestjs/common';
import { AIService } from './ai.service';
import { Response } from 'express'; 
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
@Post()
  async generatePoster(@Body('description') description: string) {
    const prompt = `Créer une affiche artistique et colorée pour cet événement : ${description}. Affiche verticale, ambiance festive, style graphique moderne.`;
    const imageBase64 = await this.aiService.generateImage(prompt);

    return { image: `data:image/png;base64,${imageBase64}` };
  }
  
 /* @Post('generate-poster')
  async generatePosterH(@Body('description') description: string) {
    const prompt = `Créer une affiche artistique et colorée pour cet événement : ${description}. Affiche verticale, ambiance festive, style graphique moderne.`;
    const imageBase64 = await this.aiService.generateImageWithHuggingFace(prompt);
  
    return { image: `data:image/png;base64,${imageBase64}` };
  }*/
    @Post('generate-poster-flux')
    async generatePosterWithFlux(@Body() body: { description: string; title: string; startDate: string; endDate: string; location: string }) {
      const { description, title, startDate, endDate, location } = body;
    
      // Passer les informations de l'événement dans le prompt
      const imageBase64 = await this.aiService.generateImageWithFlux(title, startDate, endDate, location, description);
    
      return { image: `data:image/png;base64,${imageBase64}` };
    }
    
    
}

