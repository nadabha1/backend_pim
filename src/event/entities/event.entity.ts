import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true }) // Pour suivre la date de création et de mise à jour
export class Event {
  @Prop({ required: true })
  title: string; // Titre de l'événement

  @Prop({ required: true })
  description: string; // Description de l'événement

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId: Types.ObjectId; // ID de l'utilisateur qui crée l'événement

  @Prop({ required: true })
  date: Date; // Date de l'événement

  @Prop({ required: true })
  location: string; // Lieu de l'événement

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[]; // Liste des participants (référence aux utilisateurs)
  @Prop({ type: Number, default: 5 }) // Default join price is 5 coins
  joinPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })  // ➡️ Ajoute cette ligne
  conversationId: Types.ObjectId;  // ➡️ ID de la conversation associée

}

export const EventSchema = SchemaFactory.createForClass(Event);
