import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum NotificationType {
  INVITATION = 'INVITATION',
  NEW_PLACE = 'NEW_PLACE',
  MESSAGE = 'MESSAGE',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, ref: 'User' }) // Expéditeur de la notification
  sender: string;

  @Prop({ required: true, ref: 'User' }) // Destinataire de la notification
  recipient: string;

  @Prop({ default: false }) // Indique si la notification a été lue
  isRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
