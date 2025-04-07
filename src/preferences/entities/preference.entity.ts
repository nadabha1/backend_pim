import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';

export type PreferenceDocument = Preference & Document;
@Schema({ timestamps: true }) // ✅ Automatically adds createdAt & updatedAt fields
export class Preference extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', unique: true })
  user: Types.ObjectId;

  @Prop({ required: false, enum: ['Male', 'Female', 'Other', 'Prefer not to declare'] })
  gender?: string;
  
  @Prop({ type: [String], default: [] })
  favoriteActivities?: string[];
  
  @Prop({ type: [String], default: [] })
  eventPreferences?: string[];
  
  @Prop({ required: false, enum: ['Solo Activities', 'Small Groups', 'Large Gatherings'] })
  socialPreference?: string;
  
  @Prop({ required: false, enum: ['Morning', 'Afternoon', 'Evening', 'No Preference', 'Late Night'] })
  preferredEventTime?: string;
  
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
