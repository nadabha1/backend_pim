import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/message/message.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    console.log(`✅ [BACKEND] Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ [BACKEND] Client déconnecté : ${client.id}`);
  }
@SubscribeMessage('sendMessage')
async handleMessage(client: Socket, payload: any) {
  console.log("📥 [BACKEND] Message reçu côté serveur :", payload);

  if (!payload) {
    console.log("⚠️ [BACKEND] Payload est undefined !");
    return;
  }

  const { conversationId, senderId, content } = payload?.data || payload;

  if (!conversationId || !senderId || !content) {
    console.log("⚠️ [BACKEND] Données manquantes ou invalides :", payload);
    return;
  }

  try {
    const message = await this.messageService.createMessage(conversationId, senderId, content);
    console.log("✅ [BACKEND] Message sauvegardé dans la BDD :", message);

    // ✅ Vérifie cette ligne !
    this.server.to(conversationId).emit('receiveMessage', message);
    console.log("📤 [BACKEND] Message diffusé à la room :", conversationId);
  } catch (error) {
    console.log("❌ [BACKEND] Erreur lors de l'enregistrement du message :", error.message);
  }
}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, conversationId: string) {
    client.join(conversationId);
    console.log(`🚪 [BACKEND] Client ${client.id} a rejoint la room ${conversationId}`);
  }
}
