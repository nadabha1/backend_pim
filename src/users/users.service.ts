import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Preference } from 'src/preferences/entities/preference.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { CarnetService } from 'src/carnet/carnet.service';
import { PreferencesModule } from 'src/preferences/preferences.module';
import { Types } from 'mongoose';
import { PreferencesService } from 'src/preferences/preferences.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Preference.name) private preferenceModel: Model<Preference>,
    private readonly mailerService: MailerService,
    private readonly carnetService: CarnetService, 
    private readonly preferenceService: PreferencesService,  // Adjust path as needed

  ) {}

  /**
   * ✅ Create a new user and send an email confirmation link
   */
  async create(user: Partial<User>, preferences: Partial<Preference>): Promise<User> {
    try {
        if (!user || !user.password) {
            throw new BadRequestException('Invalid user data. Password is required.');
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = new this.userModel({
            ...user,
            password: hashedPassword,
            isVerified: false,
        });

        const savedUser = await newUser.save();
        console.log("🟢 User successfully saved:", savedUser);
        console.log("🟢 Generated User ID:", savedUser._id);

        await savedUser.save();
        console.log("✅ Preferences linked to User:", savedUser._id);

        await this.sendVerificationEmail(savedUser.email, savedUser._id.toString());
        return savedUser;
    } catch (error) {
        console.error("❌ Error creating user:", error);
        throw new InternalServerErrorException(`Error creating user: ${error.message}`);
    }
}
async findAllExceptCreator(creatorId: string) {
  return await this.userModel.find({ _id: { $ne: creatorId } });
}

async sendVerificationEmail(email: string, userId: string): Promise<void> {
  console.log(`🟢 Preparing to send email to: ${email}, User ID: ${userId}`);

  if (!userId) {
      console.error("❌ ERROR: userId is undefined in sendVerificationEmail!");
      throw new Error("userId is undefined in sendVerificationEmail");
  }

  const verificationLink = `http://localhost:3000/auth/confirm/${userId}`;
  console.log(`🟢 Generated Verification Link: ${verificationLink}`);

  try {
      await this.mailerService.sendMail({
          to: email,
          subject: 'Verify Your Email',
          template: './welcome-email', // Ensure this file exists in your templates folder
          context: { 
              verificationLink,  // Pass verification link
              userId  // Ensure userId is explicitly passed
          },
      });

      console.log("✅ Email sent successfully!");
  } catch (error) {
      console.error("❌ ERROR sending email:", error.message);
      throw new Error(`Email sending failed: ${error.message}`);
  }
}



  /**
   * ✅ Verify Email when User Clicks the Confirmation Link
   */

  /**
   * ✅ Get user by email
   */
  async verifyUserEmail(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
        return null;
    }

    if (user.isVerified) {
        console.log("✅ User already verified.");
        return user;
    }

    // ✅ Update `isVerified` in the database
    user.isVerified = true;
    await user.save();

    console.log(`✅ User ${id} is now verified.`);
    return user;
}


  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * ✅ Get user by ID with preferences
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).populate('preferences').exec();
  }

  async addUserPreferences(userId: string, preferences: Partial<Preference>): Promise<Preference> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

  
    const existingPreferences = await this.preferenceModel.findOne({ user: userId });
    if (existingPreferences) {
      throw new BadRequestException('Preferences already exist for this user');
    }
  
    const newPreferences = new this.preferenceModel({
      user: userId,
      ...preferences,
    });
  
    const savedPreferences = await newPreferences.save();
    user.preferences = new Types.ObjectId(savedPreferences._id.toString());
    await user.save();
  
     await this.preferenceService.generateTagsFromPreferences(userId);
     return savedPreferences;
  }
  
  async getUserPreferencesById(userId: string): Promise<Preference> {
    const preferences = await this.preferenceModel.findOne({ user: userId }).exec();
    if (!preferences) {
      throw new NotFoundException('Preferences not found for this user');
    }
    return preferences;
  }

  /**
   * ✅ Update user details
   */
  async updateAvailability(userId: string, availability: any[]) {
    return this.userModel.findByIdAndUpdate(userId, {
      availability: availability,
    });
  }
  // Exemple de méthode fictive : renvoyer tous les users avec leurs créneaux de disponibilité
async findAllWithAvailability(): Promise<User[]> {
  return this.userModel.find({ disponibilites: { $exists: true } }).exec();
}

  async update(id: string, updateData: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  /**
   * ✅ Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<Preference>): Promise<Preference> {
    const updatedPreferences = await this.preferenceModel.findOneAndUpdate(
      { user: userId },
      { $set: preferences },
      { new: true }
    ).exec();

    if (!updatedPreferences) {
      throw new NotFoundException('Preferences not found for this user');
    }

    return updatedPreferences;
  }

  /**
   * ✅ Delete user and preferences
   */
  async delete(id: string): Promise<User> {
    await this.preferenceModel.findOneAndDelete({ user: id }).exec();
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * ✅ Forgot Password (OTP)
   */
  async forgotPassword(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 3600000); // Expires in 1 hour
    await user.save();

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset OTP',
      template: './reset-password-otp',
      context: { name: user.name, otp },
    });

    return 'Password reset OTP sent to your email';
  }

  
  /**
   * ✅ Reset Password with OTP
   */
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<string> {
    const user = await this.userModel.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired OTP');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    return 'Password reset successful';
  }
  async unlockPlace(userId: string, placeId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier si l'utilisateur a déjà débloqué cette place
    if (user.unlockedPlaces.includes(placeId)) {
      throw new BadRequestException('Place already unlocked');
    }

    // Vérifier si l'utilisateur a assez de coins
    if (user.coins < 5) {
      throw new BadRequestException('Not enough coins to unlock this place');
    }

    // Trouver le propriétaire du carnet auquel appartient cette place
    const ownerId = await this.carnetService.getOwnerByPlace(placeId);
    if (!ownerId) {
      throw new NotFoundException('Carnet not found for this place');
    }

    // Déduire 5 coins de l'utilisateur qui débloque
    user.coins -= 5;
    user.unlockedPlaces.push(placeId);
    await user.save();

    // Ajouter 10 coins au propriétaire du carnet
    const owner = await this.userModel.findById(ownerId);
    if (owner) {
      owner.coins += 10;
      await owner.save();
    }

    return { 
      message: 'Place unlocked successfully', 
      coinsRemaining: user.coins, 
      ownerCoins: owner ? owner.coins : 0 
    };
  }

async getUnlockedPlaces(userId: string): Promise<string[]> {
  const user = await this.userModel.findById(userId);
  
  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user.unlockedPlaces;
}

async getAllUsers(): Promise<User[]> {
  return this.userModel.find().exec(); // Récupère tous les utilisateurs
}
 // Ajouter une place aux favoris
 async addPlaceToFavorites(userId: string, placeId: string): Promise<User> {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Convertir placeId en ObjectId
  const placeObjectId = new Types.ObjectId(placeId);

  // Vérifier si la place existe déjà dans les favoris
  if (user.favorites.includes(placeObjectId)) {
    throw new BadRequestException('Place already in favorites');
  }

  // Ajouter la place aux favoris
  user.favorites.push(placeObjectId);
  await user.save();

  return user;
}
async addUserPreference(userId: string, preferenceId: string) {
  return this.userModel.findByIdAndUpdate(userId, { $set: { preferences: preferenceId } });
}
async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
  return this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
}
async addUserFavorite(userId: string, placeId: string) {
  return this.userModel.findByIdAndUpdate(userId, { $push: { favorites: placeId } });
}
async removePlaceFromFavorites(userId: string, placeId: string): Promise<User> {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Convertir placeId en ObjectId
  const placeObjectId = new Types.ObjectId(placeId);

  // Vérifier si la place est bien dans les favoris
  if (!user.favorites.some(id => id.equals(placeObjectId))) {
    throw new BadRequestException('Place not found in favorites');
  }

  // Supprimer la place des favoris
  user.favorites = user.favorites.toObject().filter(id => !id.equals(placeObjectId));
  await user.save();

  return user;
}


}

