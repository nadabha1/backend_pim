import { Controller, Post, Get, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { EventService } from './event.service';
import { EventType } from './entities/event.entity';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(
    @Body() body: {
      creatorId: string;
      title: string;
      description: string;
      date: string;
      location: string;
      joinPrice?: number;
      type: EventType;
    }
  ) {
    const event = await this.eventService.createEvent(
      body.creatorId,
      body.title,
      body.description,
      new Date(body.date),
      body.location,
      body.joinPrice,
      body.type // ✅ Include event type
    );
    return event;
  }
  

  @Get("")
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
  @Get('user/:userId')
  async getUserEvents(@Param('userId') userId: string) {
    return this.eventService.getEventsByUser(userId);
  }


  // Add the update route
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() body: { title?: string; description?: string; date?: string; location?: string; joinPrice?: number }
  ) {
    return await this.eventService.updateEvent(id, body);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.eventService.deleteEvent(id);
  }
  @Get('specific/:userId')
async findSpecificEvents(@Param('userId') userId: string) {
  return await this.eventService.findSpecificEvents(userId);
}

}