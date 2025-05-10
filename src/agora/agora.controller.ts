import { Controller, Get, Post, Body, Query, NotFoundException, Delete } from '@nestjs/common';
import { AgoraService } from './agora.service';

@Controller('agora')
export class AgoraController {
  constructor(private readonly agoraService: AgoraService) {}

  /**
   * Endpoint pour générer un token Agora
   * @param channelName Le nom du canal
   * @param uid L'ID de l'utilisateur
   * @param role Le rôle de l'utilisateur (PUBLISHER ou READER)
   * @returns Le token Agora
   */
  @Get('token')
  getToken(
    @Query('channelName') channelName: string,
    @Query('uid') uid: number,
    @Query('role') role: string,
  ): string {
    // Assurez-vous que le rôle est correctement mappé
    const userRole = role === 'PUBLISHER' ? 'PUBLISHER' : 'SUBSCRIBER';
    return this.agoraService.generateToken(channelName, uid, userRole);
  }
 

}
