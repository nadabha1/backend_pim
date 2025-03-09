import { Controller, Get, Post, Patch, Delete, Param, Body, HttpStatus, HttpException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // 🟢 Créer une notification
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.notificationService.createNotification(createNotificationDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Notification créée avec succès',
        data: notification,
      };
    } catch (error) {
      throw new HttpException('Erreur lors de la création de la notification', HttpStatus.BAD_REQUEST);
    }
  }

  // 🟢 Récupérer les notifications d'un utilisateur
  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationService.getUserNotifications(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications récupérées avec succès',
      data: notifications,
    };
  }

  // 🟢 Marquer une notification comme lue
  // 🟢 Marquer une notification comme lue et retourner ses détails
@Patch(':id/read')
async markAsRead(@Param('id') id: string) {
  const notification = await this.notificationService.markAsRead(id);
  return {
    statusCode: HttpStatus.OK,
    message: 'Notification marquée comme lue',
    data: notification, // 🟢 Retourner les détails de la notification
  };
}


  // 🟢 Supprimer une notification
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.notificationService.deleteNotification(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification supprimée avec succès',
    };
  }

  // 🟢 Compter les notifications non lues
  @Get('unread-count/:userId')
  async countUnreadNotifications(@Param('userId') userId: string) {
    const count = await this.notificationService.countUnreadNotifications(userId);
    return {
      statusCode: HttpStatus.OK,
      unreadCount: count,
    };
  }
}
