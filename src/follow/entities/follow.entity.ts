import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true }) // Pour suivre la date de follow/unfollow
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  follower: Types.ObjectId; // Celui qui suit
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  following: Types.ObjectId; // Celui qui est suivil'utilisateur suivi

  @Prop({ default: Date.now })
  createdAt: Date; // Date de suivi
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
