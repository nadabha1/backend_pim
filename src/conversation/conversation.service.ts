import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation } from './entities/conversation.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/socket.gateway';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class ConversationService {
  constructor(@InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
  private readonly notificationService: NotificationService, // ✅ Injection du service de notification
  private readonly socketGateway: NotificationGateway, // ✅ Injection du WebSocket Gateway
) {}

  async getUserConversations(userId: string) {
    const conversations = await this.conversationModel
      .find({ participants: userId })
      .populate({
        path: 'participants', 
        model:'User',
        select: 'name' // Ajoute avatarUrl pour éviter le crash
      })
      .populate({
        path: 'lastMessage',
        select: 'content createdAt'
      })
      .exec();
  
    console.log("Conversations trouvées:", JSON.stringify(conversations, null, 2)); // 🔍 Log pour debug
    return conversations;
  }
  
  async createConversation(participants: string[]) {
    const conversation = await this.conversationModel.create({ participants });
    return conversation;
  }
  
  
  async createConversation25(userId: string, otherUserId: string) {
    // Vérifie si une conversation entre ces deux utilisateurs existe déjà
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [userId, otherUserId] }
    });
  
    if (existingConversation) {
      return existingConversation; // Retourne la conversation existante
    }
  
    // Crée une nouvelle conversation avec les deux participants
    const conversation = await this.conversationModel.create({
      participants: [userId, otherUserId] // 👈 Ajoute bien les deux
    });

    return conversation;
  }
  async createConversation2(userId: string, otherUserId: string) {
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [userId, otherUserId] }
    });
  
    if (existingConversation) {
      return existingConversation;
    }
  
    const conversation = await this.conversationModel.create({
      participants: [userId, otherUserId]
    });
  
    // ✅ Envoi de la notification en temps réel via WebSocket
    this.socketGateway.sendNotification(
      userId, // Sender
      otherUserId, // Recipient
      NotificationType.MESSAGE, // Type
      `Vous avez une nouvelle conversation avec ${userId}.` // Message
    );
      
    return conversation;
  }
  
  
}
