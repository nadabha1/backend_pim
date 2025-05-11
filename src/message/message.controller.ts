import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Get(':userId')
  getMessages(@Param('userId') userId: string) {
    return this.messageService.getMessagesForUser(userId);
  }
  @Get(':id/messages')
async getConversationMessages(@Param('id') conversationId: string) {
  return await this.messageService.getMessages(conversationId);
}
@Get('conversation/:id')
async getConversationMessages2(@Param('id') conversationId: string) {
  return await this.messageService.getMessages(conversationId);
}
@Get('/c/:conversationId')
async getMessages2(@Param('conversationId') conversationId: string) {
  return this.messageService.getMessagesByConversation(conversationId);
}
@Post()
async sendMessage(@Body() body: { conversationId: string; senderId: string; content: string ,eventId:string,type: string}) {
  return await this.messageService.createMessage(body.conversationId, body.senderId, body.content,body.eventId,body.type);
}
@Post('audio')
@UseInterceptors(
  FileInterceptor('audio', {
    storage: diskStorage({
      destination: './uploads/audio',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `audio-${uniqueSuffix}${ext}`);
      },
    }),
  }),
)
async sendAudioMessage(
  @UploadedFile() file: Express.Multer.File,
  @Body('conversationId') conversationId: string,
  @Body('senderId') senderId: string,
) {
  const audioPath = `uploads/audio/${file.filename}`;
  return await this.messageService.createaudioMessage(
    conversationId,
    senderId,
    audioPath, // contenu = chemin du fichier
    null,
    'audio',
  );
}

}
