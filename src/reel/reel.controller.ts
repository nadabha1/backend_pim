import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UploadedFile,
  Get,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ReelService } from './reel.service';

@Controller('reels')
export class ReelController {
  constructor(private readonly reelsService: ReelService) {}

// ✅ reel.controller.ts

@Post('upload')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'files', maxCount: 10 },
    { name: 'music', maxCount: 1 }
  ], {
    storage: diskStorage({
      destination: './uploads/reels',
      filename: (req, file, cb) => {
        const filename = uuidv4() + path.extname(file.originalname);
        cb(null, filename);
      },
    }),
  }),
)
async uploadReel(
  @Body('eventId') eventId: string,
  @Body('userId') userId: string,
  @Body('isShared') isShared: boolean,
  @UploadedFiles() files: { files?: Express.Multer.File[], music?: Express.Multer.File[] },
) {
  console.log('🟢 Reçu:', { eventId, userId, isShared });
  const imageUrls = files.files.map(file => `uploads/reels/${file.filename}`);
  const musicFilename = files.music?.[0]?.filename;

  return this.reelsService.saveReel({
    eventId,
    userId,
    mediaUrls: imageUrls,
    isShared,
    music: musicFilename || null,
  });
}



 /* @Post('generate/:eventId')
  async generateReel(@Param('eventId') eventId: string) {
    try {
      const outputPath = await this.reelsService.generateReel(eventId);
      return { message: 'Reel généré', path: outputPath };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }*/
    @Post('generate/:eventId/:userId')
    async generateReel(
      @Param('eventId') eventId: string,
      @Param('userId') userId: string,
    ) {
      // Vérification de l'existence de l'événement et de l'utilisateur
      console.log('Event ID:', eventId);
      console.log('User ID:', userId);
      try {
        const outputPath = await this.reelsService.generateReel(eventId, userId);
        return { message: 'Reel généré', path: outputPath };
      } catch (err) {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
    @Get()
    async getReels(@Query('eventId') eventId: string) {
      try {
        console.log('Event ID:', eventId);
        const reels = await this.reelsService.findReelsByEvent(eventId);
        const formattedReels = reels.map(reel => ({
          ...reel.toObject(), // pour convertir en objet simple
          videoUrl: `reels/${reel.eventId}_${reel.userId}.mp4`, // ✅ Chemin du fichier vidéo généré
        }));
        console.log('Formatted Reels:', formattedReels);
        return formattedReels;
      } catch (error) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
    
  @Post('add-music/:eventId')
  async addMusic(
    @Param('eventId') eventId: string,
    @Body('music') musicFileName: string,
  ) {
    try {
      const path = await this.reelsService.addMusicToReel(eventId, musicFileName);
      return { message: 'Musique ajoutée', path };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('upload-music')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './assets/audio', // 📍 le dossier audio déjà existant
    filename: (req, file, cb) => {
      const fileName = file.originalname; // garde le nom original
      cb(null, fileName);
    },
  }),
}))
async uploadMusic(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    throw new HttpException('Aucun fichier reçu', HttpStatus.BAD_REQUEST);
  }
  return { message: 'Musique uploadée', filename: file.filename };
}

}
