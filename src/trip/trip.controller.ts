import { Controller, Post, Body, Patch } from '@nestjs/common';
import { TripService } from './trip.service';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post('generate')
  async generateItinerary(
    @Body('destination') destination: string,
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('userId') userId: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    const result = await this.tripService.generateItinerary(
      destination,
      days,
      userId,
      start
    );

    return {
      itinerary: result.itinerary,
      coinsRemaining: result.coinsRemaining,
      message: 'Trip generated successfully',
    };
  }

  @Patch('update-day')
  async updateTripDay(
    @Body('userId') userId: string,
    @Body('dayIndex') dayIndex: number,
    @Body('newActivities') newActivities: string[],
  ) {
    const result = await this.tripService.updateTripDay(
      userId,
      dayIndex,
      newActivities,
    );

    return {
      message: 'Day updated successfully',
      updatedItinerary: result.itinerary,
    };
  }
}
