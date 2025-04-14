import { Injectable } from '@nestjs/common';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { EventService } from 'src/event/event.service';
import { UsersService } from 'src/users/users.service';
import { NotificationService } from 'src/notification/notification.service';
import { Cron } from '@nestjs/schedule';

const dayjs = require('dayjs');
require('dayjs/locale/fr');
dayjs.locale('fr');


function formatDate(date: Date): string {
  return dayjs(date).format('dddd D MMMM YYYY, HH:mm');
}

@Injectable()
export class CalendarService {
  constructor(
    private readonly eventService: EventService,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron('0 * * * *') // ⏰ Toutes les heures
async handleRecommendation() {
  const users = await this.userService.findAllWithAvailability();

  for (const user of users) {
    for (const slot of user.availability) {
      const startDate = new Date(slot.start);
const endDate = new Date(slot.end);


const events = await this.eventService.findEventsBetween(startDate, endDate);

      if (events.length) {
        const message = `🧠 Tu es libre entre ${startDate} et ${endDate} ? Voici un événement pour toi : ${events[0].title}`;
        await this.notificationService.sendSimple(user._id as string, message);
      }
    }
  }
}

}
