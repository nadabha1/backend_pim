import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { CreateFreeTimeDto } from './dto/create-free-time.dto';
import { UpdateFreeTimeDto } from './dto/update-free-time.dto';
import { FreeTimeService } from './free-times.service';

// free-time.controller.ts

@Controller('free-time')
export class FreeTimeController {
  constructor(private readonly freeTimeService: FreeTimeService) {}

 /* @Post()
  async addFreeTime(@Body() body: { userId: string; start: string; end: string }) {
    const { userId, start, end } = body;

    // Validate userId format
    if (!userId || userId.length !== 24) {
      throw new BadRequestException('Invalid userId format');
    }

    try {
      return this.freeTimeService.createFreeTime(userId, new Date(start), new Date(end));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }*/

    @Post()
    async addFreeTime(@Body() body: { userId: string; freeSlots: { start: string; end: string }[] }) {
      const { userId, freeSlots } = body;
  
      console.log(`Received request: userId=${userId}, freeSlots=${JSON.stringify(freeSlots)}`); // Debugging log
  
      // Validate userId format
      if (!userId || userId.length !== 24) {
        throw new BadRequestException('Invalid userId format');
      }
  
      if (!Array.isArray(freeSlots) || freeSlots.length === 0) {
        throw new BadRequestException('No free slots provided');
      }
  
      try {
        for (const slot of freeSlots) {
          const { start, end } = slot;
  
          // Validate start and end date formats
          const parsedStart = new Date(start);
          const parsedEnd = new Date(end);
  
          if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
            console.error(`Invalid date format received: start=${start}, end=${end}`);
            throw new BadRequestException('Invalid date format for start or end');
          }
  
          await this.freeTimeService.createFreeTime(userId, start, end);
        }
  
        return { message: 'Free slots successfully saved' };
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }
  @Get(':userId')
  async getFreeTime(@Param('userId') userId: string) {
    // Validate userId format
    if (!userId || userId.length !== 24) {
      throw new BadRequestException('Invalid userId format');
    }

    try {
      return this.freeTimeService.getFreeTimeByUser(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
