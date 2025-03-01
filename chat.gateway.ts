import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { MessageService } from "src/message/message.service";

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private users = new Map<string, string>(); // socketId -> userId

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    const { userId } = client.handshake.query;
    this.users.set(client.id, userId as string);
    console.log(`User ${userId} connected`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.users.get(client.id);
    this.users.delete(client.id);
    console.log(`User ${userId} disconnected`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: { receiverId: string, content: string }) {
    const senderId = this.users.get(client.id);
    const { receiverId, content } = payload;

    const message = await this.messageService.createMessage(senderId, receiverId, content);

    // Send to receiver if connected
    const receiverSocket = [...this.users.entries()].find(([, id]) => id === receiverId)?.[0];
    if (receiverSocket) {
      client.to(receiverSocket).emit('receiveMessage', message);
    }

    // Also emit to sender (in case sender wants to see sent message in their UI immediately)
    client.emit('messageSent', message);
  }
}
