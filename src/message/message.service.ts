import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { Conversation } from 'src/conversation/entities/conversation.entity';

@Injectable()
export class MessageService {
  constructor(@InjectModel(Message.name) private messageModel: Model<Message>,
  @InjectModel(Conversation.name) private conversationModel: Model<Conversation>
) {}

async createMessage(conversationId: string, senderId: string, content: string) {
  const message = new this.messageModel({
    conversation: conversationId,
    sender: senderId,
    content: content,
  });

  const savedMessage = await message.save();  // Save the message

  // After saving, update the last message and last message date in the conversation
  await this.conversationModel.updateOne(
    { _id: conversationId },
    {
      $set: {
        lastMessage: savedMessage._id,  // Set the last message ID
        lastMessageDate: savedMessage.createdAt,  // Set the createdAt timestamp of the message
      },
    }
  );

  return savedMessage;  // Return the saved message
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
