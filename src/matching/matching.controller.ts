import { Controller, Get, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('match')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  // ✅ Endpoint principal pour matcher avec les autres utilisateurs
  @Post(':userId')
  async matchUser(@Param('userId') userId: string) {
    try {
      const matches = await this.matchingService.matchUserWithDatabase(userId);
      return { success: true, results: matches };
    } catch (err) {
      throw new HttpException(
        { message: err.message || 'Erreur lors du matching' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🔍 (Optionnel) Pour tester le profil texte généré avant matching
  @Get('profile/:userId')
  async showUserProfile(@Param('userId') userId: string) {
    try {
      return await this.matchingService.matchUser(userId);
    } catch (err) {
      throw new HttpException(
        { message: err.message || 'Erreur lors de la génération du profil' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
