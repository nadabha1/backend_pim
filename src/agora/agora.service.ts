import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as agora from 'agora-access-token';
import { Model } from 'mongoose';

@Injectable()
export class AgoraService {
  // Définition directe de l'appId et de l'appCertificate
  private readonly appId: string = '6d5a203e2d024f2c92c9e9f44bc37390';  // Remplacez par votre App ID
  private readonly appCertificate: string = '193dafab8f4041839efb17749d86c7b5';  // Remplacez par votre certificat App



  constructor(
   
  ) {}

 

  /**
   * Génère un token pour un utilisateur pour rejoindre un canal
   * @param channelName Le nom du canal auquel l'utilisateur veut se joindre
   * @param uid L'ID unique de l'utilisateur
   * @param role Le rôle de l'utilisateur dans le canal (PUBLISHER/READER)
   * @returns Le token généré
   */
  generateToken(channelName: string, uid: number, role: 'PUBLISHER' | 'SUBSCRIBER'): string {
    const expirationTime = Math.floor(Date.now() / 1000) + 3600; // Token valide pendant 1 heure

    const token = agora.RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      role === 'PUBLISHER' ? agora.RtcRole.PUBLISHER : agora.RtcRole.SUBSCRIBER,
      expirationTime
    );

    return token;
  }
 
}
