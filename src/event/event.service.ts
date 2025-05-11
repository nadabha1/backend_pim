import { Injectable, Inject, forwardRef, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { Event, EventDocument, EventType } from './entities/event.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { ConversationService } from 'src/conversation/conversation.service';
import { NotificationGateway } from 'src/notification/socket.gateway';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { UsersService } from 'src/users/users.service';
import { Preference, PreferenceDocument } from 'src/preferences/entities/preference.entity';
import { FreeTimeService } from 'src/free-times/free-times.service';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => UsersService)) private readonly usersService: UsersService, // ✅ Use only this instance
    private conversationService: ConversationService,
    private readonly socketGateway: NotificationGateway,
    private readonly freeTimeService: FreeTimeService,
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,
  ) {}
  
  async createEvent(
    creatorId: string,
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    location: string,
    joinPrice: number = 5,
    type: EventType,
    imagePath?: string 
  ) {
    const creatorObjectId = Types.ObjectId.createFromHexString(creatorId);

    const conversation = await this.conversationService.createConversationGroup({
      participants: creatorId,
      title: title, // Utiliser le titre de l'événement comme nom du groupe
    });

    // Create the event with creator as a participant
    const event = new this.eventModel({
      creatorId: creatorObjectId,
      title,
      description,
      startDate: new Date(startDate), // Parse ISO string to Date
      endDate: new Date(endDate),     // Parse ISO string to Date
      location,
      participants: [creatorObjectId],
      joinPrice,
      conversationId: conversation._id,
      type,
      imagePath,
    });

    const savedEvent = await event.save();

    // Reward creator with 10 coins
    const user = await this.userModel.findById(creatorObjectId);
    if (user) {
      user.coins = (user.coins || 0) + 5;
      await user.save();
    } else {
      throw new Error('Creator not found');
    }
    this.socketGateway.sendNotification({
      senderId: creatorId,
      recipientId: creatorId,
      type: NotificationType.NEW_Event,
      content: `Great! Your event "${title}" has been created!`,
      data: { eventId: savedEvent._id.toString() },
    });

    const allUsersExceptCreator = await this.usersService.findAllExceptCreator(creatorId);

    // 🟢 Envoyer `NEW_EVENT_All` à tous les autres utilisateurs
    for (const user of allUsersExceptCreator) {
      this.socketGateway.sendNotification({
        senderId: creatorId,
        recipientId: user._id.toString(),
        type: NotificationType.NEW_EVENT_All,
        content: `Don't miss it! The new event "${title}" is here!`,
        data: { eventId: savedEvent._id.toString() },
      });
    }

    return savedEvent;
  }

  // Trouve les événements entre deux dates
  async findEventsBetween(start: Date, end: Date): Promise<Event[]> {
    return this.eventModel.find({
      startDate: { $gte: start },
      endDate: { $lte: end }
    }).exec();
  }

  async findOne(id: string) {
    const events = await this.eventModel.findById(id)
      .populate({
        path: 'participants', 
        model: 'User',
        select: '_id name' // Ajoute avatarUrl pour éviter le crash
      })
      .exec();
    return events;
  }

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
      .populate('participants', 'name') // côté Node.js + Mongoose
      .exec();
  }

  async findAllEvents() {
    const events = await this.eventModel
      .find()
      .populate({
        path: 'participants', 
        model: 'User',
        select: '_id name' // Ajoute avatarUrl pour éviter le crash
      });
    const result = events.map(event => ({
      ...event.toObject(), // 👈 Convertit à un objet simple
      participantNames: event.participants.map(
        (p: any) => p.name // 👉 On peut accéder à p.name car c’est un objet mongoose
      ),
    }));

    return result;
  }

  async joinEvent(eventId: string, userId: string) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const userObjectId = Types.ObjectId.createFromHexString(userId);
    const event = await this.eventModel.findById(eventObjectId);
    if (!event) throw new Error('Event not found');

    if (!event.participants.includes(userObjectId)) {
      const user = await this.userModel.findById(userObjectId);
      if (!user || user.coins < event.joinPrice) {
        throw new HttpException('Insufficient coins', HttpStatus.BAD_REQUEST); // ou 402
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

  async getEventsByUser(userId: string): Promise<Event[]> {
    return this.eventModel.find({ creatorId: new Types.ObjectId(userId) }).exec();
  }

  async updateEvent(eventId: string, updateData: { title?: string; description?: string; startDate?: string;
    endDate?: string; location?: string; joinPrice?: number }) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const event = await this.eventModel.findById(eventObjectId);
    
    if (!event) throw new Error('Event not found');
    
    // Update fields that are provided
    if (updateData.title) event.title = updateData.title;
    if (updateData.description) event.description = updateData.description;
    if (updateData.startDate) event.startDate = new Date(updateData.startDate);
    if (updateData.endDate) event.endDate = new Date(updateData.endDate);
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
    const event = await this.eventModel
      .find({ type: { $in: preferredEventTypes } })
      .populate({
        path: 'participants', 
        model: 'User',
        select: '_id name' // Ajoute avatarUrl pour éviter le crash
      }).exec();
    const result = event.map(event => ({
      ...event.toObject(), // 👈 Convertit à un objet simple
      participantNames: event.participants.map(
        (p: any) => p.name // 👉 On peut accéder à p.name car c’est un objet mongoose
      ),
    }));
    
    return result;
  }

  async findEventsDuringUserFreeTime(userId: string): Promise<Event[]> {
    const freeTimes = await this.freeTimeService.getFreeTimeByUser(userId);
    if (!freeTimes || freeTimes.length === 0) return [];
  
    // Construct query to find events during the free slots
    const orConditions = freeTimes.map(({ start, end }) => ({
      $or: [
        { startDate: { $gte: new Date(start) } },  // Event starts after or at the free time start
        { endDate: { $lte: new Date(end) } },      // Event ends before or at the free time end
      ]
    }));
  
    return this.eventModel.find({ $or: orConditions }).exec();
  }

  async findNonConflictingEvents(userId: Types.ObjectId): Promise<Event[]> {
    const userEvents = await this.eventModel.find({
      $or: [{ creatorId: userId }, { participants: userId }],
    });

    console.log(`📌 Events for user ${userId}:`, userEvents);

    const conflictingEventIds = userEvents.map(event => event._id);

    const nonConflictingEvents = await this.eventModel.find({
      $or: [
        { _id: { $nin: conflictingEventIds } }, // Events not in conflict
        { participants: userId }, // Include events the user has already joined
        { startDate: { $gte: new Date() } },
        { endDate: { $gte: new Date() } },
      ],
    });

    console.log(`✅ Non-conflicting events found:`, nonConflictingEvents);

    return nonConflictingEvents;
  }

  async deleteEventsByUser(userId: string): Promise<void> {
    const events = await this.eventModel.find({ creatorId: userId });
    
    for (const event of events) {
      // Rembourser les participants (optionnel)
      for (const participantId of event.participants) {
        const user = await this.userModel.findById(participantId);
        if (user) {
          user.coins += event.joinPrice; // Remboursement du prix d'entrée
          await user.save();
        }
      }

      // Supprimer l'événement
      await this.eventModel.findByIdAndDelete(event._id);
    }
  }

  async getEventsCreatedByUser(userId: string): Promise<Event[]> {
    return this.eventModel.find({ creatorId: new Types.ObjectId(userId) }).exec();
  }

  async leaveEvent(eventId: string, userId: string) {
    const eventObjectId = Types.ObjectId.createFromHexString(eventId);
    const userObjectId = Types.ObjectId.createFromHexString(userId);
  
    const event = await this.eventModel.findById(eventObjectId);
    if (!event) throw new Error('Event not found');
  
    // Vérifie si l'utilisateur fait bien partie des participants
    const index = event.participants.findIndex(p => p.equals(userObjectId));
    if (index === -1) {
      throw new HttpException('User is not a participant of this event', HttpStatus.BAD_REQUEST);
    }
  
    // Retire l'utilisateur de la liste des participants
    event.participants.splice(index, 1);
    await event.save();
  
   /* // Optionnel : remboursement des coins
    const user = await this.userModel.findById(userObjectId);
    if (user) {
      user.coins += event.joinPrice;
      await user.save();
    }*/
  
    // Supprimer l'utilisateur de la conversation liée à l'événement
    const conversation = await this.conversationService.findConversationByTitle(event.title);
    if (conversation) {
      await this.conversationService.removeUserFromConversation(conversation._id.toString(), userId);
    }
  
    return { message: 'Successfully left the event' };
  }
  
}