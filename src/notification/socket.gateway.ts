import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UsersService } from 'src/users/users.service'; // ✅ Import UsersService if needed

@WebSocketGateway({ cors: true })
@Injectable()
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => NotificationService)) private readonly notificationService: NotificationService, // ✅ Use forwardRef for NotificationService
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService, // ✅ Use forwardRef for UsersService
  ) {}

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    console.log(`👤 Utilisateur ${userId} rejoint sa room WebSocket`);
    client.join(userId);
  }

  async sendNotification({
    senderId,
    recipientId,
    type,
    content,
    data = {}, // 🟢 Ajouter `data` avec une valeur par défaut
  }: {
    senderId: string;
    recipientId: string;
    type: string;
    content: string;
    data?: Record<string, string>; // 🟢 Déclarer `data` comme optionnel
  }) {
  
    console.log(`📢 Envoi d'une notification à ${recipientId} : ${content}`);

    const notification = await this.notificationService.createNotification({
      sender: senderId,
      recipient: recipientId,
      type: type as any,
      message: content,
      data, // 🟢 Inclure les données supplémentaires dans la notification
    });

    this.server.to(recipientId).emit('newNotification', notification);
  }
}
