import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() body: { creatorId: string; title: string; description: string; date: string; location: string; joinPrice?: number }) {
    const event = await this.eventService.createEvent(
      body.creatorId,
      body.title,
      body.description,
      new Date(body.date),
      body.location,
      body.joinPrice,
    );
    return event;
  }

  @Get()
  async findAlluser(@Query('userId') userId: string) {
    return await this.eventService.findAll(userId);
  }
  @Get("all")
  async findAll() {
    
    return await this.eventService.findAllEvents(); // Fetch all events if no userId
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Body() body: { userId: string }) {
    return await this.eventService.joinEvent(id, body.userId);
  }
}