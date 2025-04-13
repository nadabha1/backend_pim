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

  async createMessage(conversationId: string, senderId: string, content: string,  eventId?: string, type?: string
  ) {
    const message = new this.messageModel({
      conversation: conversationId,
      sender: senderId,
      content: content || '', // facultatif si seulement un event est partagé
      event: eventId ?? null,
      type: type ?? null,
    
    });


    return await message.save();
  }

  async getMessages(conversationId: string) {
    return await this.messageModel
      .find({ conversation: conversationId })  // 🔥 Fetch messages for this conversation
      .populate({
        path: 'sender', 
        model:'User',
        select: 'name' // Ajoute avatarUrl pour éviter le crash
      })
      .exec();
  }
  
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.messageModel
      .find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name')  // 🔄 Utiliser `populate` pour obtenir le nom de l'utilisateur
      .exec();
  }
  async getMessagesForUser(userId: string) {
    return this.messageModel.find({ $or: [{ senderId: userId }, { receiverId: userId }] });
  }
}
