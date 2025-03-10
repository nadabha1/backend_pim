import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Event, EventDocument, EventType } from './entities/event.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { ConversationService } from 'src/conversation/conversation.service';
import { NotificationGateway } from 'src/notification/socket.gateway';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { UsersService } from 'src/users/users.service';
import { Preference,PreferenceDocument } from 'src/preferences/entities/preference.entity';
 // Adjust path as needed

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly userService: UsersService,  // 🟢 Injecter UserService
    private conversationService: ConversationService, // Adjust path as needed
    private readonly socketGateway: NotificationGateway, // ✅ Injection du WebSocket Gateway
    
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,

  ) {}
  async createEvent(
    creatorId: string,
    title: string,
    description: string,
    date: Date,
    location: string,
    joinPrice: number = 5,
    type: EventType
  ) {
    const creatorObjectId = Types.ObjectId.createFromHexString(creatorId);

    const conversation =await this.conversationService.createConversationGroup({
      participants: creatorId,
      title: title,  // Utiliser le titre de l'événement comme nom du groupe
    });


    // Create the event with creator as a participant
  
    const event = new this.eventModel({
      creatorId: creatorObjectId,
      title,
      description,
      date,
      location,
      participants: [creatorObjectId],
      joinPrice,
      conversationId: conversation._id,  // ➡️ Associe l'ID de la conversation ici
      type, // ✅ Save event type
    });
  
    const savedEvent = await event.save();
  
    // Reward creator with 10 coins
    const user = await this.userModel.findById(creatorObjectId);
    if (user) {
      user.coins = (user.coins || 0) + 10;
      await user.save();
    } else {
      throw new Error('Creator not found');
    }
    this.socketGateway.sendNotification({
      senderId: creatorId,
      recipientId: creatorId,
      type: NotificationType.NEW_Event,
      content: `Votre événement "${title}" a été créé avec succès.`,
      data: { eventId: savedEvent._id.toString() },
    });

    const allUsersExceptCreator = await this.userService.findAllExceptCreator(creatorId);

    // 🟢 Envoyer `NEW_EVENT_All` à tous les autres utilisateurs
    for (const user of allUsersExceptCreator) {
      this.socketGateway.sendNotification({
        senderId: creatorId,
        recipientId: user._id.toString(),
        type: NotificationType.NEW_EVENT_All,
        content: `Un nouvel événement "${title}" a été créé. Découvrez-le vite !`,
        data: { eventId: savedEvent._id.toString() },
      });

    }

  
    return savedEvent;
  }
  async findOne(id: string) {
    return await this.eventModel.findById(id).populate('participants').exec();
  }
// event.service.ts

async isUserJoined(eventId: string, userId: string): Promise<boolean> {
  const event = await this.eventModel.findById(eventId);
  if (!event) throw new Error('Event not found');

  // ✅ Convertir userId en ObjectId avant de vérifier
  const userObjectId = new Types.ObjectId(userId);
  
  return event.participants.includes(userObjectId);
}
  async findAll(userId: string) {
    return await this.eventModel
      .find({
        $or: [
          { creatorId: Types.ObjectId.createFromHexString(userId) },
          { participants: Types.ObjectId.createFromHexString(userId) },
        ],
      })
      .populate('participants')
      .exec();
  }

 // event.service.ts
async findAllEvents() {
  const events = await this.eventModel
    .find()
    .populate('participants')
    .exec();
  
  console.log("📢 Events trouvés:", events);  // ➡️ LOG pour vérifier
  return events;
}

  async joinEvent(eventId: string, userId: string) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const userObjectId = Types.ObjectId.createFromHexString(userId);
    const event = await this.eventModel.findById(eventObjectId);
    if (!event) throw new Error('Event not found');

    if (!event.participants.includes(userObjectId)) {
        const user = await this.userModel.findById(userObjectId);
        if (!user || user.coins < event.joinPrice) {
            throw new Error('Insufficient coins');
        }
        event.participants.push(userObjectId);
        user.coins -= event.joinPrice;
        await event.save();
        await user.save();
    }

    // ✅ Récupération correcte de la conversation
    const conversation = await this.conversationService.findConversationByTitle(event.title);
    if (conversation) {
        // ✅ Correction du type avec "as string"
        await this.conversationService.addUserToConversation(conversation._id.toString(), userId);
    } else {
        console.log(`❌ Conversation not found for event: ${event.title}`);
    }

    return event;
}


  async getEventsByUser(userId: string) {
    return this.eventModel.find({ where: { creatorId: userId } });
  }
  async updateEvent(eventId: string, updateData: { title?: string; description?: string; date?: string; location?: string; joinPrice?: number }) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const event = await this.eventModel.findById(eventObjectId);
    
    if (!event) throw new Error('Event not found');
    
    // Update fields that are provided
    if (updateData.title) event.title = updateData.title;
    if (updateData.description) event.description = updateData.description;
    if (updateData.date) event.date = new Date(updateData.date);
    if (updateData.location) event.location = updateData.location;
    if (updateData.joinPrice !== undefined) event.joinPrice = updateData.joinPrice;

    await event.save();
    return event;
  }
  async deleteEvent(eventId: string) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const event = await this.eventModel.findById(eventObjectId);
    
    if (!event) throw new Error('Event not found');
    
    // Refund coins to participants (optional)
    for (let userId of event.participants) {
      const user = await this.userModel.findById(userId);
      if (user) {
        user.coins += event.joinPrice; // Refund the join price
        await user.save();
      }
    }
  
    // Delete the event using deleteOne or findByIdAndDelete
    await this.eventModel.findByIdAndDelete(eventObjectId);
  
    return { message: 'Event deleted successfully' };
  }
  
  async findSpecificEvents(userId: string): Promise<Event[]> {

    // Fetch the user's preferences
    console.log("Searching for preferences with userId:", userId);

    const userPreferences = await this.preferenceModel.findOne({ user: userId });

    
    console.log("Fetched user preferences:", userPreferences);
    
  
    if (!userPreferences) {
      throw new Error('User preferences not found');
    }
  
    // Ensure the user has event preferences
    const preferredEventTypes = userPreferences.eventPreferences || [];
  
    if (preferredEventTypes.length === 0) {
      // If no preferences, return an empty list (or return all events as a fallback)
      return [];
    }
  
    // Find events where the type matches one of the preferred event types
    return await this.eventModel
      .find({ type: { $in: preferredEventTypes } })
      .populate('participants')
      .exec();
  }
  
  
}