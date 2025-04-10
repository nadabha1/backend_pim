import { Module } from '@nestjs/common';
import { TripPlanningController } from './trip.controller';
import { TripPlanningService } from './trip.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],  // Import HttpModule to make external API calls
  controllers: [TripPlanningController],
  providers: [TripPlanningService],
})
export class TripPlanningModule {}
