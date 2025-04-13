import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversation: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  seenBy: Types.ObjectId[];
    // ✅ Nouveau champ pour partager un événement
  @Prop({ type: Types.ObjectId, ref: 'Event', required: false })
  event?: Types.ObjectId;
  @Prop({ type: String, required: false })
  type?: string;
}

// Génération automatique du schéma Mongoose
export const MessageSchema = SchemaFactory.createForClass(Message);
