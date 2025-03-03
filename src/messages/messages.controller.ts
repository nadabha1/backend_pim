import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('events/:eventId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Param('eventId') eventId: string, @Body() body: { userId: string; messages: string }) {
    const messages = await this.messagesService.createMessages(eventId, body.userId, body.messages);
    return messages;
  }

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    return await this.messagesService.findMessagesByEvent(eventId);
  }
}