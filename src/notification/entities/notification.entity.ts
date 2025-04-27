import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  INVITATION = 'INVITATION',
  NEW_PLACE = 'NEW_PLACE',
  NEW_Event = 'NEW_Event',  
  NEW_EVENT_All = 'NEW_EVENT_All',  
  MESSAGE = 'MESSAGE',
  FOLLOW= 'FOLLOW',
  INFO='INFO'
}

export enum NotificationCategory {
  SOCIAL = 'SOCIAL',       // ✅ Notifications sociales (amis, groupes, etc.)
  SYSTEM = 'SYSTEM',       // ✅ Notifications système (mises à jour, alertes)
  PROMOTION = 'PROMOTION', // ✅ Notifications promotionnelles
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, enum: NotificationCategory, default: NotificationCategory.SOCIAL })
  category: NotificationCategory; // ✅ Catégorie de notification

  @Prop({ required: true })
  message: string; // Renommé depuis `content` pour plus de clarté

  @Prop({ required: true, ref: 'User', type: Types.ObjectId }) // Expéditeur
  sender: string;

  @Prop({ required: true, ref: 'User', type: Types.ObjectId }) // Destinataire
  recipient: string;

  @Prop({ default: false }) // Si la notification a été lue
  isRead: boolean;

  @Prop({ type: Map, of: String, default: {} }) // ✅ Données supplémentaires (par ex: ID de conversation)
  data: Record<string, string>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
