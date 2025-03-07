import { Controller, Post, UploadedFile, UseInterceptors, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './dist/uploads',  // Enregistre dans dist/uploads après build
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'No file uploaded',
      };
    }

    return {
      status: HttpStatus.CREATED,
      message: 'File uploaded successfully!',
      filename: file.filename,  // Retourne uniquement le nom du fichier
    };
  }
}
