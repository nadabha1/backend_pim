import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessagesDocument = Messages & Document;

@Schema({ timestamps: true })
export class Messages {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  Messages: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages);