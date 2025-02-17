import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type CarnetDocument = Carnet & Document;

@Schema()
export class Place {

  @Prop({ type: Types.ObjectId }) // Ajoute ceci pour que MongoDB génère un ID unique
  _id: Types.ObjectId;

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
}

@Schema()
export class Carnet extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  owner: string; // User ID

  @Prop({ type: [Place], default: [] })
  places: Place[];
}

export const CarnetSchema = SchemaFactory.createForClass(Carnet);
