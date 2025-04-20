import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class TripService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly TRIP_GENERATION_COST = 20;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro-latest',
      generationConfig: { temperature: 0.9 },
    });
  }

  async generateItinerary(
    destination: string,
    days: number,
    userId: string,
    startDate: Date,
  ): Promise<{ itinerary: any[]; coinsRemaining: number }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.coins < this.TRIP_GENERATION_COST) {
      throw new BadRequestException(`Not enough coins.`);
    }

    const prompt = `Generate a detailed ${days}-day itinerary for ${destination}`;
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

    return { itinerary: structuredItinerary, coinsRemaining: user.coins };
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
