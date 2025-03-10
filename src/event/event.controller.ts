import { Controller, Post, Get, Body, Param, Query, Patch, Delete } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}
// Vérifier si l'utilisateur est inscrit à l'événement
@Get(':eventId/joined/:userId')
async isUserJoined(
  @Param('eventId') eventId: string,
  @Param('userId') userId: string,
) {
  const isJoined = await this.eventService.isUserJoined(eventId, userId);
  return { joined: isJoined };
}

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
  @Get(':id')
async findOne(@Param('id') id: string) {
  if (id === 'all') {
    return await this.eventService.findAllEvents();  // ✅ Appeler `findAll` si `id` est `all`
  } else {
    return await this.eventService.findOne(id);  // ✅ Sinon, appeler `findOne`
  }
}


  @Get()
  async findAlluser(@Query('userId') userId: string) {
    return await this.eventService.findAll(userId);
  }
  @Get("all")
  async getAllEvents() {
    const events = await this.eventService.findAllEvents();
    console.log("📢 Events fetched from API:", events);  // ➡️ LOG pour vérifier
    return events;
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
}