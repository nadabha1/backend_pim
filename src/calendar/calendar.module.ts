import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { UsersModule } from 'src/users/users.module';
import { EventModule } from 'src/event/event.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [UsersModule,EventModule,NotificationModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
