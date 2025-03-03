import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Message, MessageDocument } from './message/entities/message.entity';
import { MessageService } from './message/message.service';


@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private messageService: MessageService,
  ) {}

  @SubscribeMessage('joinEvent')
  async handleJoin(@MessageBody() data: { eventId: string; userId: string }, @ConnectedSocket() client: Socket) {
    const eventId = Types.ObjectId.createFromHexString(data.eventId);
    const userId = Types.ObjectId.createFromHexString(data.userId);
    // Optional: Validate if user is a participant (requires EventService integration)
    client.join(data.eventId);
    client.emit('joined', { message: `Joined event ${data.eventId} chat` });

    // Send existing messages to the new participant
    const messages = await this.messageService.findMessagesByEvent(data.eventId);
    client.emit('initialMessages', messages);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { eventId: string; userId: string; message: string }, @ConnectedSocket() client: Socket) {
    const newMessage = await this.messageService.createMessage(data.eventId, data.userId, data.message);
    client.to(data.eventId).emit('receiveMessage', newMessage);
    client.emit('receiveMessage', newMessage); // Send to sender too
  }
}