import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReelMedia } from './entities/reel.entity';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as ffmpegPath from '@ffmpeg-installer/ffmpeg';
import * as fluentFfmpeg from 'fluent-ffmpeg';
  
  fluentFfmpeg.setFfmpegPath(ffmpegPath.path);
  
@Injectable()
export class ReelService {
  constructor(
    @InjectModel(ReelMedia.name)
    private reelModel: Model<ReelMedia>,
  ) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path); // ✅ Définir chemin ffmpeg
  }

  // 📸 Étape 1 : Sauvegarde des fichiers image associés à un événement
  // ✅ reel.service.ts

async saveReel(data: {
  eventId: string;
  userId: string;
  mediaUrls: string[];
  isShared: boolean;
  music?: string | null;
}): Promise<ReelMedia> {
  return await this.reelModel.create(data);
}

  // 🧪 Option B (rarement utile ici) : génération via globbing
  async findReelsByEvent(eventId: string) {
    if (!eventId) throw new Error('Event ID manquant');
    return this.reelModel.find({ eventId });
  }
  
  async generateReel(eventId: string, userId: string): Promise<string> {
    const reel = await this.reelModel.findOne({ eventId, userId });
    if (!reel || reel.mediaUrls.length === 0) {
      throw new Error('Aucune image trouvée');
    }
  
    const outputDir = path.join(__dirname, '../../public/reels');
    const outputPath = path.join(outputDir, `${eventId}_${userId}.mp4`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  
    const concatFile = path.join(__dirname, '../../uploads/reels/concat.txt');
    const fileLines = reel.mediaUrls.map((imgPath) => {
      const absolutePath = path.resolve(__dirname, '../../', imgPath);
      return `file '${absolutePath.replace(/\\/g, '/')}'\nduration 3`;
    });
    const lastImage = path.resolve(__dirname, '../../', reel.mediaUrls[reel.mediaUrls.length - 1]);
    fileLines.push(`file '${lastImage.replace(/\\/g, '/')}'`);
    fs.writeFileSync(concatFile, fileLines.join('\n'));
  
    // ✅ Traitement musique (optionnel)
    const hasMusic = reel.music && fs.existsSync(path.join(__dirname, '../../uploads/reels', reel.music));
    const musicPath = hasMusic ? path.join(__dirname, '../../uploads/reels', reel.music) : null;
  
    return new Promise((resolve, reject) => {
      let command = fluentFfmpeg()
        .input(concatFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions([
          '-vf', 'scale=1280:720',
          '-pix_fmt', 'yuv420p',
          '-r', '30',
        ]);
  
      if (hasMusic) {
        command = command.input(musicPath!).outputOptions(['-shortest']);
      }
  
      command
        .on('start', cmd => console.log('🎬 FFmpeg CMD:', cmd))
        .on('end', () => {
          console.log('✅ Vidéo générée:', outputPath);
          resolve(`reels/${eventId}_${userId}.mp4`);
        })
        .on('error', err => {
          console.error('❌ FFmpeg error:', err.message);
          reject(new Error('Erreur génération vidéo'));
        })
        .save(outputPath);
    });
  }
  
  
  async generateVideo(eventId: string): Promise<string> {
    const inputDir = path.join(__dirname, '../../uploads/reels', eventId);
    const outputPath = path.join(__dirname, `../../public/reels/${eventId}.mp4`);

    if (!fs.existsSync(inputDir)) throw new Error("📁 Dossier d'images introuvable");

    return new Promise((resolve, reject) => {
      const command = `ffmpeg -framerate 1 -pattern_type glob -i '${inputDir}/*.jpg' -c:v libx264 -r 30 -pix_fmt yuv420p ${outputPath}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erreur exec ffmpeg :', stderr);
          return reject('Erreur génération vidéo');
        }
        console.log('✅ Vidéo générée via glob :', outputPath);
        resolve(`reels/${eventId}.mp4`);
      });
    });
  }

  async addMusicToReel(eventId: string, musicFilename: string): Promise<string> {
    const videoPath = path.join(__dirname, `../../public/reels/${eventId}.mp4`);
    const musicPath = path.join(__dirname, `../../assets/audio/${musicFilename}`);
    const finalPath = path.join(__dirname, `../../public/reels/${eventId}_with_music.mp4`);

    // ✅ Vérifier l'existence du fichier
    if (!fs.existsSync(videoPath)) throw new Error('🎥 Vidéo non trouvée');
    if (!fs.existsSync(musicPath)) throw new Error('🎵 Fichier musique non trouvé');

    return new Promise((resolve, reject) => {
      const command = `ffmpeg -i "${videoPath}" -i "${musicPath}" -shortest -c:v copy -c:a aac "${finalPath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Erreur ajout musique :', stderr);
          return reject('Erreur ajout musique');
        }
        fs.unlinkSync(videoPath); // delete old video
        fs.renameSync(finalPath, videoPath); // rename temp => original name
  

        console.log('✅ Musique ajoutée avec succès');
        resolve(`reels/${eventId}.mp4`);
      });
    });
  }

  async deleteReelsByUser(userId: string): Promise<void> {
    await this.reelModel.deleteMany({ userId }).exec();
  }

}
