import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Trip } from './entities/trip.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationCategory, NotificationType } from 'src/notification/entities/notification.entity';
@Injectable()
export class TripService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly TRIP_GENERATION_COST = 20;

  constructor(
    private readonly notificationService: NotificationService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Trip.name) private readonly tripModel: Model<Trip>,

  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      generationConfig: { temperature: 0.9 },
    });
  }
  async acceptTrip(
    userId: string,
    destination: string,
    startDate: Date,
    endDate: Date,
    itinerary: any[],
  ): Promise<Trip> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // 📈 Calculate statistics
    const numberOfDays = itinerary.length;
    const totalActivities = itinerary.reduce(
      (sum, day) => sum + (day.activities?.length || 0),
      0,
    );
  
    const trip = await this.tripModel.create({
      userId,
      destination,
      startDate,
      endDate,
      itinerary,
      status: 'accepted',
      numberOfDays,
      totalActivities,
    });
  
    // 🔵 Check if the trip starts tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
  
    if (startDate.toDateString() === tomorrow.toDateString()) {
      await this.notificationService.createNotification({
        type: NotificationType.NEW_Event,
        category: NotificationCategory.SYSTEM,
        message: `Your trip to ${destination} starts tomorrow! 🎒`,
        sender: userId,
        recipient: userId,
        data: { tripId: trip._id.toString() },
      });
    }
  
    return trip;
  }
  



  async generateItinerary(
    destination: string,
    days: number,
    userId: string,
    startDate: Date,
    regenerate?: boolean,
  ): Promise<{ itinerary: any[]; coinsRemaining: number }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    if (user.coins < this.TRIP_GENERATION_COST) {
      throw new BadRequestException(`Not enough coins.`);
    }
  
    // ✨ If regenerate flag is true, change the prompt
    const prompt = regenerate
      ? `Generate a DIFFERENT ${days}-day itinerary for ${destination}. Make it clearly different from a previous plan, with new activities and new places.`
      : `Generate a detailed ${days}-day itinerary for ${destination}`;
  
    let itinerary: string;
  
    try {
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
      });
      itinerary = result.response.text();
    } catch (error) {
      throw new Error('Failed to generate itinerary');
    }
  
    const structuredItinerary = this.parseItinerary(itinerary, startDate);
  
    user.coins -= this.TRIP_GENERATION_COST;
    await user.save();
  
    await this.tripModel.create({
      userId,
      destination,
      startDate,
      endDate: new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000),
      itinerary: structuredItinerary,
    });
  
    return {
      itinerary: structuredItinerary,
      coinsRemaining: user.coins,
    };
  }
  
  

  private parseItinerary(itinerary: string, startDate: Date): any[] {
    const days = itinerary.split('**Day');
    const structuredDays = days.slice(1).map((day, index) => {
      const dayParts = day.split('\n').filter((line) => line.trim().length > 0);
      const date = new Date(
        startDate.getTime() + index * 24 * 60 * 60 * 1000,
      );
      return {
        date: date.toISOString().split('T')[0],
        activities: dayParts,
      };
    });
    return structuredDays;
  }
 
  
  async updateTripDay(
    userId: string,
    dayIndex: number,
    newActivities: string[],
  ): Promise<{ itinerary: any[] }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let itinerary = user.itinerary || [];

    if (dayIndex < 0 || dayIndex >= itinerary.length) {
      throw new BadRequestException('Invalid day index');
    }

    if (!itinerary[dayIndex].activities) {
      itinerary[dayIndex].activities = [];
    }

    itinerary[dayIndex].activities = newActivities;

    user.itinerary = itinerary;
    await user.save();

    return { itinerary };
  }
}
