import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {}

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
      data, // ��� Inclure les données supplémentaires dans la notification
    });

    this.server.to(recipientId).emit('newNotification', notification);
  }
}
