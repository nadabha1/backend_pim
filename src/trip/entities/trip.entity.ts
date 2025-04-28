// src/trip/entities/trip.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Trip extends Document {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) destination: string;
  @Prop({ required: true }) startDate: Date;
  @Prop({ required: true }) endDate: Date;
  @Prop({ type: Array }) itinerary: any[];
  @Prop({ default: 'draft' }) status: string;
    @Prop({ default: 0 })
  totalActivities: number;

  @Prop({ default: 0 })
  numberOfDays: number;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
