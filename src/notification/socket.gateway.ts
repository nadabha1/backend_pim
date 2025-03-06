import { WebSocketGateway, WebSocketServer, OnGatewayConnection, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({ cors: true })
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    console.log(`⚡ Un utilisateur s'est connecté : ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    console.log(`👤 Utilisateur ${userId} rejoint sa room WebSocket`);
    client.join(userId);
  }

  async sendNotification(senderId: string, recipientId: string, type: string, content: string) {
    console.log(`📢 Envoi d'une notification à ${recipientId} : ${content}`);

    const notification = await this.notificationService.createNotification(
      senderId,
      recipientId,
      type as any,
      content
    );
  
    this.server.to(recipientId).emit('newNotification', notification);
  }
}
