import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('events/:eventId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Param('eventId') eventId: string, @Body() body: { userId: string; message: string }) {
    const message = await this.messageService.createMessage(eventId, body.userId, body.message);
    return message;
  }

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    return await this.messageService.findMessagesByEvent(eventId);
  }
}