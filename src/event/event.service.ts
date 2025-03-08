import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Event, EventDocument } from './entities/event.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
 // Adjust path as needed

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createEvent(creatorId: string, title: string, description: string, date: Date, location: string, joinPrice: number = 5) {
    const creatorObjectId = Types.ObjectId.createFromHexString(creatorId);

    // Create the event with creator as a participant
    const event = new this.eventModel({
      creatorId: creatorObjectId,
      title,
      description,
      date,
      location,
      participants: [creatorObjectId], // Creator is automatically a participant
      joinPrice,
    });

    // Save the event first to get the event ID
    const savedEvent = await event.save();

    // Reward the creator with 10 coins
    const user = await this.userModel.findById(creatorObjectId);
    if (user) {
      user.coins = (user.coins || 0) + 10; // Add 10 coins
      await user.save();
    } else {
      throw new Error('Creator not found');
    }

    return savedEvent;
  }

  async findAll(userId: string) {
    return await this.eventModel
      .find({
        $or: [
          { creatorId: Types.ObjectId.createFromHexString(userId) },
          { participants: Types.ObjectId.createFromHexString(userId) },
        ],
      })
      .populate('participants')
      .exec();
  }

  async findAllEvents() {
    return await this.eventModel.find().populate('participants').exec();
  }

  async joinEvent(eventId: string, userId: string) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const userObjectId = Types.ObjectId.createFromHexString(userId);
    const event = await this.eventModel.findById(eventObjectId);
    if (!event) throw new Error('Event not found');

    if (!event.participants.includes(userObjectId)) {
      const user = await this.userModel.findById(userObjectId);
      if (!user || user.coins < event.joinPrice) {
        throw new Error('Insufficient coins');
      }
      event.participants.push(userObjectId);
      user.coins -= event.joinPrice;
      await event.save();
      await user.save();
    }
    return event;
  }
  async getEventsByUser(userId: string) {
    return this.eventModel.find({ where: { creatorId: userId } });
  }
  
  
  
}