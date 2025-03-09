import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from './entities/conversation.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/socket.gateway';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ConversationService {
  constructor(@InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
  @InjectModel(User.name) private userModel: Model<User>, // 🟢 Injection du modèle User
  private readonly notificationService: NotificationService, // ✅ Injection du service de notification
  private readonly socketGateway: NotificationGateway, // ✅ Injection du WebSocket Gateway
) {}
async getUserConversationsname(userId: string) {
  const conversations = await this.conversationModel
    .findById(userId)
    .populate({
        path: 'participants', 
        model:'User',
        select: 'name' // Ajoute avatarUrl pour éviter le crash
      })
    .exec();

  console.log("Conversations trouvées:", JSON.stringify(conversations, null, 2)); // 🔍 Log pour debug
  return conversations;
}
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
  }async createConversationGroup(data: { participants: String; title: string }) {
    const conversation = new this.conversationModel({
      participants: data.participants,
      title: data.title,
    });
    return await conversation.save();
  }  async addUserToConversation(conversationId: string, userId: string) {
    await this.conversationModel.updateOne(
        { _id: new Types.ObjectId(conversationId) },
        { $addToSet: { participants: new Types.ObjectId(userId) } }  // ✅ Empêche les doublons
    );
}
     // ✅ Cherche une conversation par son titre
     async findConversationByTitle(title: string) {
      return await this.conversationModel.findOne({ title });
  }
  
  async createConversationavecnot(userId: string, otherUserId: string) {
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [userId, otherUserId] }
    });
  
    if (existingConversation) {
      return existingConversation;
    }
  
    const conversation = await this.conversationModel.create({
      participants: [userId, otherUserId]
    });
  
    // 🟢 Récupérer les noms des utilisateurs
    const sender = await this.userModel.findById(userId).select('name');
    const recipient = await this.userModel.findById(otherUserId).select('name');
  
    if (sender && recipient) {
      // ✅ Envoi de la notification avec le nom de l'expéditeur
      this.socketGateway.sendNotification({
        senderId: userId,
        recipientId: otherUserId,
        type: NotificationType.MESSAGE,
        content: `Vous avez une nouvelle conversation avec ${sender.name}.`, // 🟢 Utiliser le nom ici
        data: { conversationId: conversation._id.toString() } // 🟢 Inclure l’ID de la conversation
      });
    }
  
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
    this.socketGateway.sendNotification({
      senderId: userId,
      recipientId: otherUserId,
      type: NotificationType.MESSAGE,
      content: `Vous avez une nouvelle conversation avec ${userId}.`,
    });
    
      
    return conversation;
  }
  
  
}
