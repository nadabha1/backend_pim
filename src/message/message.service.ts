import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>,
) {}

  async createMessage(conversationId: string, senderId: string, content: string) {
    const message = new this.messageModel({
      conversation: conversationId,
      sender: senderId,
      content: content,
    });

    return await message.save();
  }

  async getMessages(conversationId: string) {
    return await this.messageModel
      .find({ conversation: conversationId })  // 🔥 Fetch messages for this conversation
      .populate('sender', 'name avatar')  // Optional: Get sender details
      .exec();
  }
  
  
  async getMessagesForUser(userId: string) {
    return this.messageModel.find({ $or: [{ senderId: userId }, { receiverId: userId }] });
  }
}
