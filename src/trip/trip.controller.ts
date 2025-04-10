import { Controller, Post, Body } from '@nestjs/common';
import { TripPlanningService } from './trip.service';

@Controller('trip-planning')
export class TripPlanningController {
  constructor(private readonly tripPlanningService: TripPlanningService) {}

  @Post('plan')
  async planTrip(@Body() tripDetails: { destination: string; days: number }) {
    return this.tripPlanningService.generatePlan(tripDetails);
  }
}
