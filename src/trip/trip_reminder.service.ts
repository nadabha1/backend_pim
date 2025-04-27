import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip } from './entities/trip.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationCategory, NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class TripReminderService {
  private readonly logger = new Logger(TripReminderService.name);

  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<Trip>,
    private readonly notificationService: NotificationService
  ) {}

  // 🕒 Exécuté chaque jour à 8h du matin
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendTripReminders() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(tomorrow.getDate() + 1);

    const trips = await this.tripModel.find({
      startDate: { $gte: tomorrow, $lt: dayAfter },
      status: "accepted", // ✅ Only accepted trips
    });

    for (const trip of trips) {
      await this.notificationService.createNotification({
        type: NotificationType.NEW_Event,
        category: NotificationCategory.SYSTEM,
        message: `Your trip to ${trip.destination} starts tomorrow! 🎒`,
        sender: trip.userId,
        recipient: trip.userId,
        data: { tripId: trip._id.toString() },
      });

      this.logger.log(`🔔 Reminder sent to user ${trip.userId} for trip to ${trip.destination}`);
    }
  }
}
