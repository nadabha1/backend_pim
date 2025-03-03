import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Message, MessageDocument } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<MessageDocument>) {}

  async createMessage(eventId: string, userId: string, message: string) {
    const newMessage = new this.messageModel({
      eventId: Types.ObjectId.createFromHexString(eventId),
      userId: Types.ObjectId.createFromHexString(userId),
      message,
    });
    return await newMessage.save();
  }

  async findMessagesByEvent(eventId: string) {
    return await this.messageModel
      .find({ eventId: Types.ObjectId.createFromHexString(eventId) })
      .sort({ timestamp: 1 })
      .exec();
  }
}