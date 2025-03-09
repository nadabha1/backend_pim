import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: String, required: false,default:'' })
  title: string;  // ✅ Nom du groupe

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User', required: true }] })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: Types.ObjectId;
}

// Génération automatique du schéma Mongoose
export const ConversationSchema = SchemaFactory.createForClass(Conversation);
