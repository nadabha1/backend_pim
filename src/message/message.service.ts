import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>,
  @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
  @Inject(forwardRef(() => ChatGateway))
  private readonly notificationGateway: ChatGateway,
  
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
    const masage = await message.save();
    this.notificationGateway.server.to(conversationId).emit('newMessage', masage);

    
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: masage._id,
      updatedAt: new Date(), // optional: also update last activity
    });
return masage; // Retourne le message créé
  }

  async getMessages(conversationId: string) {
    return await this.messageModel
      .find({ conversation: conversationId })  // 🔥 Fetch messages for this conversation
      .populate({
        path: 'sender', 
        model:'User',
        select: 'name profileImage' 
      })
      .exec();
  }
  
  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return this.messageModel
      .find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage')  // 🔄 Utiliser `populate` pour obtenir le nom de l'utilisateur
      .exec();
  }
  async getMessagesForUser(userId: string) {
    return this.messageModel.find({ $or: [{ senderId: userId }, { receiverId: userId }] });
  }

  async createaudioMessage(
    conversationId: string,
    senderId: string,
    content: string,
    eventId?: string,
    type?: string,
  ) {
    const message = new this.messageModel({
      conversation: conversationId,
      sender: senderId,
      content: content || '',
      event: eventId ?? null,
      type: type ?? 'text', // 'audio', 'event', etc.
    });
  
    return await message.save();
  }

  async deleteMessagesByUser(userId: string): Promise<void> {
    await this.messageModel.deleteMany({ sender: userId }).exec();
  }
}
