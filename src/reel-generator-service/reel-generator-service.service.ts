// ✨ CONTINUATION from previous steps for Reel memories feature

// ✨ Étape 4 : Génération automatique de vidéo avec ffmpeg
// Ajout d’un service pour générer le montage

import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReelGeneratorService {
  async generateVideo(eventId: string): Promise<string> {
    const inputPath = path.join(__dirname, '../../uploads/reels');
    const outputPath = path.join(__dirname, `../../public/reels/${eventId}.mp4`);

    // Créer le dossier s’il n’existe pas
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const command = `ffmpeg -framerate 1 -pattern_type glob -i '${inputPath}/*.jpg' -c:v libx264 -r 30 -pix_fmt yuv420p ${outputPath}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Erreur ffmpeg:', stderr);
          reject('Erreur génération vidéo');
        } else {
          console.log('Vidéo générée :', outputPath);
          resolve(outputPath);
        }
      });
    });
  }

  
async addMusicToReel(videoPath: string, musicPath: string, finalPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = `ffmpeg -i ${videoPath} -i ${musicPath} -shortest -c:v copy -c:a aac ${finalPath}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('Erreur ffmpeg (musique):', stderr);
          reject('Erreur ajout musique');
        } else {
          resolve(finalPath);
        }
      });
    });
  }
  
  

  // ✨ BONUS : Affichage dans Flutter
  // via VideoPlayerController.network(
  //   '${ApiConstants.baseUrl}/reels/${eventId}.mp4'
  // )
  
}

// ✨ Étape 5 (optionnelle) : Ajout de musique
