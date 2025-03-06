import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  async createNotification(sender: string, recipient: string, type: NotificationType, content: string) {
    const notification = new this.notificationModel({
      sender,
      recipient,
      type,
      content,
    });

    return notification.save();
  }
  async getUserNotifications(userId: string) {
    return await this.notificationModel.find({ recipient: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string) {
    return await this.notificationModel.findByIdAndUpdate(notificationId, { isRead: true });
  }
}
