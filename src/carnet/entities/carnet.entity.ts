import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type CarnetDocument = Carnet & Document;

@Schema()
export class Place extends Document {

 

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  latitude: number;

  @Prop({ required: false })
  longitude: number;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ default: 5 }) // Par défaut, un lieu coûte 5 Coins
  unlockCost: number;

  @Prop({ type: [String], default: [] })
  images: string[];
  
  @Prop({ default: 0 })
  averageRating: number; // Note moyenne des avis
}

@Schema()
export class Carnet extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  owner: string; // User ID

  @Prop({ type: [Place], default: [] })
  places: Place[];
  
  @Prop({ default: 0 }) // Note globale par défaut de 0
  globalAverageRating: number;

}

export const CarnetSchema = SchemaFactory.createForClass(Carnet);
