import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationGateway } from './socket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,

    @Inject(forwardRef(() => NotificationGateway))
    private readonly gateway: NotificationGateway // ✅ via forwardRef
  ) {}
  async sendSimple(userId: string, message: string) {
    console.log(`🔔 Notification pour ${userId} : ${message}`);
    await this.createNotification({
      sender: null, // ou system admin ID
      recipient: userId,
      type: NotificationType.INFO,
      message,
      data: {},
    });
  
    // ✅ Émettre aussi via WebSocket si connecté
    this.gateway?.server.to(userId).emit('newNotification', {
      recipient: userId,
      message,
      type: 'info',
    });
  }
  
  async createNotification(createNotificationDto: CreateNotificationDto) {
    const notification = new this.notificationModel(createNotificationDto);
    return notification.save();
  }
  async getUserNotifications(userId: string) {
    return await this.notificationModel.find({ recipient: userId })
    .populate({
      path: 'sender',
      select: 'name', // 🟢 Récupérer seulement le nom de l'expéditeur
    })
    .sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string) {
    return await this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
  }
    // 🔵 Supprimer une notification
    async deleteNotification(notificationId: string) {
      return await this.notificationModel.findByIdAndDelete(notificationId);
    }
  
    // 🔵 Compter les notifications non lues
    async countUnreadNotifications(userId: string): Promise<number> {
      return this.notificationModel.countDocuments({
        recipient: userId,
        isRead: false,
      });
    }

    async deleteNotificationsByUser(userId: string): Promise<void> {
      // Supprimer les notifications où l'utilisateur est l'expéditeur
      await this.notificationModel.deleteMany({ sender: userId }).exec();

      // Supprimer les notifications où l'utilisateur est le destinataire
      await this.notificationModel.deleteMany({ recipient: userId }).exec();
    }
}
