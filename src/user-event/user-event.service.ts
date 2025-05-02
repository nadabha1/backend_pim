import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserEvent } from './entities/user-event.entity';

@Injectable()
export class UserEventService {
  constructor(
    @InjectModel('UserEvent') private readonly userEventModel: Model<UserEvent>,
  ) {}

  async createUserEvents(userId: string, events: any[]): Promise<UserEvent[]> {
    try {
      const createdUserEvents = events.map(event => ({
        userId: userId,
        title: event.title,
        start: new Date(event.start),
        end: new Date(event.end),
        location: event.location,
        description: event.description,
      }));

      return await this.userEventModel.insertMany(createdUserEvents);
    } catch (error) {
      console.error('Error inserting user events:', error);
      throw new Error('Failed to insert user events');
    }
  }

  async getUserEvents(userId: string): Promise<UserEvent[]> {
    try {
      return await this.userEventModel.find({ userId }).exec();
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw new Error('Failed to fetch user events');
    }
  }

  async deleteUserEventsByUser(userId: string): Promise<void> {
    console.log(`Deleting UserEvents for userId: ${userId}`);
    await this.userEventModel.deleteMany({ userId });
    console.log(`✅ UserEvents for userId ${userId} deleted successfully`);
  }
}
