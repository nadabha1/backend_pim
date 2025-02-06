import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
