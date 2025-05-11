import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Preference } from 'src/preferences/entities/preference.entity';

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

@Prop({ type: Types.ObjectId, ref: 'Preference', default: null }) 
preferences: Types.ObjectId | null;
@Prop({ type: Boolean, default: false })  
isVerified: boolean;
@Prop({ type: [Types.ObjectId], ref: 'Place', default: [] })
favorites: Types.Array<Types.ObjectId>;  // Ajoutez cette ligne pour les places favorites
@Prop({ type: [String], default: [] }) 
interactions: string[];
@Prop({ type: [String], default: [] })
searchHistory: string[]; // ex : ["café", "plage", "shopping"]

@Prop({ type: [String], default: [] })
tags: string[];
@Prop({ type: [{ start: String, end: String }] })
availability: { start: string; end: string }[];
@Prop({
    type: [
      {
        activities: { type: [String], default: [] }, // Activities for each day
      },
    ],
    default: [],
  })
  itinerary: { activities: string[] }[]; // Array of days with activities
  

}

export const UserSchema = SchemaFactory.createForClass(User);
