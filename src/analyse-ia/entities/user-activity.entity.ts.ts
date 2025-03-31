import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema()
export class UserActivity {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: string; // 'search', 'click', 'unlock', etc.

  @Prop({ required: true })
  value: string; // Ex: "musée", "Parc Ennahli"

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);
