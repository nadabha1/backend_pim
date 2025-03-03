import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Messages, MessagesDocument } from './entities/messages.entity';

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Messages.name) private messagesModel: Model<MessagesDocument>) {}

  async createMessages(eventId: string, userId: string, Messages: string) {
    const newMessages = new this.messagesModel({
      eventId: Types.ObjectId.createFromHexString(eventId),
      userId: Types.ObjectId.createFromHexString(userId),
      Messages,
    });
    return await newMessages.save();
  }

  async findMessagesByEvent(eventId: string) {
    return await this.messagesModel
      .find({ eventId: Types.ObjectId.createFromHexString(eventId) })
      .sort({ timestamp: 1 })
      .exec();
  }
}