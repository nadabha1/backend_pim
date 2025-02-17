import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';

import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads', // Directory where files will be stored
      filename: (req, file, cb) => {
        // Generate a unique filename with the original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname);
        cb(null, `${uniqueSuffix}${extension}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size to 5 MB
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully!',
      filename: file.filename,
      url: `http://localhost:3000/uploads/${file.filename}`,
    };
  }
}
