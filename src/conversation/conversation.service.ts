import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
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
        select: 'name profileImage' // Ajoute avatarUrl pour éviter le crash
      })
    .exec();

  console.log("Conversations trouvées:", JSON.stringify(conversations, null, 2)); // 🔍 Log pour debug
  return conversations;
}
async getUserConversations(userId: string) {

  const conversations = await this.conversationModel
    .find({ participants: { $in: [userId] } }) // Recherche les conversations où userId est un participant
    .populate({
      path: 'participants', 
      model: 'User',
      select: 'name profileImage' // Sélectionne les informations nécessaires pour les participants
    })
    .populate({
      path: 'lastMessage',
      select: 'content createdAt',
      options: { sort: { createdAt: -1 } }, // this sorts messages inside populate (useful if lastMessage is ref array, optional)
    })
    .sort({ 'lastMessage.createdAt': -1 }) // 🔥 sort by most recent message
    .exec()
    

  console.log("Conversations trouvées:", JSON.stringify(conversations, null, 2)); // Log pour debug
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
        { $addToSet: { participants: userId } }  // ✅ Empêche les doublons
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
        content: `Say hi! You have a new conversation with ${sender.name}.`, // 🟢 Utiliser le nom ici
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
      content: `Say hi! You have a new conversation with ${userId}.`,
    });
    
      
    return conversation;
  }
  

  async createConversationGroupnotevent(data: { participants: string[]; title: string }) {
    const conversation = new this.conversationModel({
      participants: data.participants, // Utiliser directement les strings pour les participants
      title: data.title,
    });
  
    return await conversation.save();
  }

  async deleteConversationsByUser(userId: string): Promise<void> {
    await this.conversationModel.deleteMany({ participants: userId }).exec();
  }

  async removeUserFromConversation(conversationId: string, userId: string) {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
  
    // Vérifie que l'utilisateur fait partie des participants
    const isParticipant = conversation.participants.some(participant =>
      participant.toString() === userId
    );
  
    if (!isParticipant) {
      throw new BadRequestException('User is not part of this conversation');
    }
  
    // Retire l'utilisateur de la conversation
    conversation.participants = conversation.participants.filter(
      participant => participant.toString() !== userId
    );
  
    // Si la conversation n’a plus de participants, tu peux décider de la supprimer
    if (conversation.participants.length === 0) {
      await this.conversationModel.findByIdAndDelete(conversationId);
    } else {
      await conversation.save();
    }
  
    return { message: 'User removed from conversation' };
  }
  
}
