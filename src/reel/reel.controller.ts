// 📦 Étape 1 : Installation des dépendances nécessaires
// -----------------------------------------------
// npm install @nestjs/platform-express multer @types/multer

// 📁 src/reels/reels.controller.ts
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { ReelService } from './reel.service';

@Controller('reels')
export class ReelController {
  constructor(private readonly reelsService: ReelService) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'files', maxCount: 10 },
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
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ) {
    const urls = files.files.map(file => `uploads/reels/${file.filename}`);
    return this.reelsService.saveReel({ eventId, userId, mediaUrls: urls });
  }
  @Post('generate/:eventId')
  async generateReel(@Param('eventId') eventId: string) {
    try {
      const outputPath = await this.reelsService.generateReel(eventId);
      return { message: 'Reel généré', path: outputPath };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('add-music/:eventId')
async addMusic(
  @Param('eventId') eventId: string,
  @Body('music') musicFileName: string, // ex: "sample.mp3"
) {
  try {
    const path = await this.reelsService.addMusicToReel(eventId, musicFileName);
    return { message: 'Musique ajoutée', path };
  } catch (err) {
    throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}