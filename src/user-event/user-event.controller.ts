import { Controller, Post, Body, Param, HttpException, HttpStatus, Get } from '@nestjs/common';
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
  @Get(':userId')
  async findByUser(@Param('userId') userId: string) {
    try {
      const events = await this.userEventService.getUserEvents(userId);
      return { message: 'User events fetched successfully', data: events };
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw new HttpException('Failed to fetch user events', HttpStatus.BAD_REQUEST);
    }
  }
}
