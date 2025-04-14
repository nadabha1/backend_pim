import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

// Define event types
export enum EventType {
  CONCERTS = 'Concerts',
  WORKSHOPS = 'Workshops',
  NETWORKING = 'Networking Events',
  SPORTS = 'Sports Activities',
  CULTURAL = 'Cultural Festivals',
  TECH = 'Tech Meetups',
  ART = 'Art Exhibitions',
  OTHER = 'Other',
}

@Schema({ timestamps: true }) 
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId;

  @Prop({ required: true }) // 🔄 Était `date`
  startDate: Date;

  @Prop({ required: true }) // 🆕 Ajouté
  endDate: Date;

  @Prop({ required: true })
  location: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[];

  @Prop({ type: Number, default: 5 }) 
  joinPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })  // ➡️ Ajoute cette ligne
  conversationId: Types.ObjectId;  // ➡️ ID de la conversation associée

  // ✅ Add the event type enum
  @Prop({ required: true, enum: EventType, default: EventType.OTHER })
  type: EventType;
  @Prop({ required: false })
  imagePath: string;

}

export const EventSchema = SchemaFactory.createForClass(Event);
