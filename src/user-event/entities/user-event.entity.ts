export class UserEvent {}
import { Schema, Document } from 'mongoose';

export interface UserEvent extends Document {
  userId: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  description: string;
}

export const UserEventSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
});
