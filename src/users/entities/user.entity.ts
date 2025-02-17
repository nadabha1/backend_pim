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
    @Prop({ default: '' }) 
    bio: string;

    @Prop({ default: '' }) 
    job: string; // Métier

    @Prop({ default: '' }) 
    location: string; // Lieu de résidence
    
    @Prop({ default: '' }) 
    profileImage: string;

    @Prop({ type: [String], default: [] }) 
    followers: string[]; // Liste d'ID des followers  

    @Prop({ type: [String], default: [] }) 
    following: string[]; // Liste d'ID des comptes suivis  

    @Prop({ type: Number, default: 0 }) 
    likes: number; // Nombre de likes reçus
    @Prop({ default: 50 }) // Default: 50 coins on sign-up
    coins: number;
    @Prop({ default: null }) // Chaque utilisateur a UN SEUL carnet
    carnetId: string | null;
    @Prop({ type: [String], default: [] }) 
unlockedCarnets: string[]; // Liste des ID des carnets débloqués  
@Prop({ type: [String], default: [] }) 
unlockedPlaces: string[]; 
}

export const UserSchema = SchemaFactory.createForClass(User);
