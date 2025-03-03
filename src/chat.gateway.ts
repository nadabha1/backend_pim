import { WebSocketGateway, WebSocketServer, ConnectedSocket, MessageBody, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Messages, MessagesDocument } from './messages/entities/messages.entity';
import { MessagesService } from './messages/messages.service';


@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Messages.name) private messagesModel: Model<MessagesDocument>,
    private messagesService: MessagesService,
  ) {}

  @SubscribeMessage('joinEvent')
  async handleJoin(@MessageBody() data: { eventId: string; userId: string }, @ConnectedSocket() client: Socket) {
    const eventId = Types.ObjectId.createFromHexString(data.eventId);
    const userId = Types.ObjectId.createFromHexString(data.userId);
    // Optional: Validate if user is a participant (requires EventService integration)
    client.join(data.eventId);
    client.emit('joined', { messages: `Joined event ${data.eventId} chat` });

    // Send existing messages to the new participant
    const messages = await this.messagesService.findMessagesByEvent(data.eventId);
    client.emit('initialMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { eventId: string; userId: string; messages: string }, @ConnectedSocket() client: Socket) {
    const newMessage = await this.messagesService.createMessages(data.eventId, data.userId, data.messages);
    client.to(data.eventId).emit('receiveMessages', newMessage);
    client.emit('receiveMessages', newMessage); // Send to sender too
  }
}