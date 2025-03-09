import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

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
async sendMessage(@Body() body: { conversationId: string; senderId: string; content: string }) {
  return await this.messageService.createMessage(body.conversationId, body.senderId, body.content);
}

}
