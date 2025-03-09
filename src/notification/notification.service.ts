import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

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
}
