import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;


@Schema()
export class User extends Document {
    @Prop({ required: true })
    name: string;
  
    @Prop({ required: true, unique: true })
    email: string;
  
    @Prop({ required: true })
    password: string;
  
    @Prop({ default: 'user' }) // Role (e.g., user, admin)
    role: string;
    @Prop({ default: null })
    resetPasswordOtp: string | null;
  
    @Prop({ default: null })
    resetPasswordOtpExpires: Date | null;
    @Prop({ default: 50 }) // Default: 50 coins on sign-up
    coins: number;
    @Prop({ default: null }) // Chaque utilisateur a UN SEUL carnet
    carnetId: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
