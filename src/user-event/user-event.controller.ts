import { Controller, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { UserEventService } from './user-event.service';

@Controller('user-events')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post(':userId')
  async create(@Param('userId') userId: string, @Body() events: any[]) {
    try {
      const createdEvents = await this.userEventService.createUserEvents(userId, events);
      return { message: 'Events created successfully', data: createdEvents };
    } catch (error) {
      console.error('Error creating user events:', error);
      throw new HttpException('Failed to create events', HttpStatus.BAD_REQUEST);
    }
  }
}
