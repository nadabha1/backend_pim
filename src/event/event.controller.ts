import { Controller, Post, Get, Body, Param, Query, Patch, Delete, BadRequestException } from '@nestjs/common';
import { EventService } from './event.service';
import { EventType, Event as CustomEventEntity } from './entities/event.entity';
import { ParseObjectIdPipe } from 'src/parse-object-id.pipe';
import { Types } from 'mongoose';

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
  async create(
    @Body() body: {
      creatorId: string;
    title: string;
    description: string;
    startDate: string; // Date ISO string avec heure
    endDate: string;   // Date ISO string avec heure
    location: string;
    joinPrice?: number;
    type: EventType;
    imagePath?: string; 

    }
  ) {
    const event = await this.eventService.createEvent(
      body.creatorId,
    body.title,
    body.description,
    new Date(body.startDate).toISOString(),
    new Date(body.endDate).toISOString(),
    body.location,
    body.joinPrice,
    body.type,
     body.imagePath
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

  

  @Get("")
  async findAlluser(@Query('userId') userId: string) {
    return await this.eventService.findAll(userId);
  }
  @Get("all")
  async getAllEvents() {
    const events = await this.eventService.findAllEvents();
    console.log("📢 Events fetched from API:", events);  // ➡️ LOG pour vérifier
    return events as CustomEventEntity[];
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Body() body: { userId: string }) {
    return await this.eventService.joinEvent(id, body.userId);
  }
  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string) {
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
@Get('suggest/:userId')
async suggestForUser(@Param('userId') userId: string) {
  return this.eventService.findEventsDuringUserFreeTime(userId);
}
// event.controller.ts
@Get('during-free-time/:userId')
async getEventsDuringUserFreeTime(@Param('userId') userId: string) {
  return this.eventService.findEventsDuringUserFreeTime(userId);
}

/*@Get('non-conflicting/:userId')
async getNonConflictingEvents(@Param('userId', ParseObjectIdPipe) userId: Types.ObjectId): Promise<CustomEventEntity[]> {
  try {
    const events = await this.eventService.findNonConflictingEvents(userId);
    return events;
  } catch (error) {
    throw new Error(`Error fetching non-conflicting events: ${error.message}`);
  }
}*/
@Get('non-conflicting/:userId')
async getNonConflictingEvents(@Param('userId') userId: string) {
  return this.eventService.findNonConflictingEvents(new Types.ObjectId(userId));
}

@Get('created-by/:userId')
async getCreatedByUser(@Param('userId') userId: string) {
  return await this.eventService.getEventsCreatedByUser(userId);
}
@Patch(':eventId/leave')
async leaveEvent(
  @Param('eventId') eventId: string,
  @Body('userId') userId: string,
) {
  return this.eventService.leaveEvent(eventId, userId);
}


}