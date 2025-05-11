// src/reels/entities/reel.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ReelMedia extends Document {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) eventId: string;
  @Prop([String]) mediaUrls: string[];
  @Prop({ default: false,required: false }) isShared: boolean;  // ✅ nouveau champ
  @Prop({ default: false,required: false }) // ✅ nouveau champ facultatif
  music?: string;
}

export const ReelMediaSchema = SchemaFactory.createForClass(ReelMedia);
