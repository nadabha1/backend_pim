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
    const API_KEY = 'AIzaSyDqaskWKGfwnk6LuNroZHnbOlp1-jV6n2M';
    this.genAI = new GoogleGenerativeAI(API_KEY);
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
    // Find the user from the database
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Check if the user has enough coins to generate a trip
    if (user.coins < this.TRIP_GENERATION_COST) {
      throw new BadRequestException(`Not enough coins.`);
    }
  
    // Create a prompt based on whether we need to regenerate the itinerary or not
    const prompt = regenerate
      ? `Generate a DIFFERENT ${days}-day itinerary for ${destination}. Make it clearly different from a previous plan, with new activities and new places.`
      : `Generate a detailed ${days}-day itinerary for ${destination}`;
  
    let itinerary: string;
  
    try {
      // Attempt to generate content using the Gemini API
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
      });
  
      // Extract the generated itinerary text
      itinerary = result.response.text();
    } catch (error) {
      // Log the full error to the console for debugging
      console.error('Error generating content with Gemini:', error);
  
      // If the error contains a response, log that as well
      if (error.response?.data) {
        console.error('Gemini API Error Response:', error.response.data);
      }
  
      // Re-throw a general error with a custom message
      throw new Error('Failed to generate itinerary');
    }
  
    // Parse the itinerary into a structured format
    const structuredItinerary = this.parseItinerary(itinerary, startDate);
  
    // Deduct the trip generation cost from the user's coins and save the user
    user.coins -= this.TRIP_GENERATION_COST;
    await user.save();
  
    // Create a new trip in the database
    await this.tripModel.create({
      userId,
      destination,
      startDate,
      endDate: new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000),
      itinerary: structuredItinerary,
    });
  
    // Return the generated itinerary and remaining coins
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

  async deleteTripsByUser(userId: string): Promise<void> {
    console.log(`Deleting trips for userId: ${userId}`);
    await this.tripModel.deleteMany({ userId });
    console.log(`✅ Trips for userId ${userId} deleted successfully`);
  }

  async getAcceptedTrips(userId: string): Promise<Trip[]> {
    return this.tripModel.find({ userId, status: 'accepted' }).sort({ startDate: 1 }).exec();
  }

}
