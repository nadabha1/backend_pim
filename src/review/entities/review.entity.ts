import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema()
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  placeId: Types.ObjectId; // Référence au lieu

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Référence à l'utilisateur qui a laissé l'avis

  @Prop({ required: true, min: 1, max: 5 })
  rating: number; // Note entre 1 et 5

  @Prop({ required: false })
  comment: string; // Commentaire facultatif

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
