import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';
import { Carnet } from 'src/carnet/entities/carnet.entity';
import { CarnetService } from 'src/carnet/carnet.service';

@Injectable()
export class UsersService {
 
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly carnetService: CarnetService,  
    private readonly mailerService: MailerService,
) {}
  async create(user: Partial<User>): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new this.userModel({ ...user, password: hashedPassword });
    return newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async delete(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

 

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 3600000); // OTP expires in 1 hour
    await user.save();

    // Send email with OTP
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset OTP',
      template: './reset-password-otp', // Template for OTP email
      context: {
        name: user.name,
        otp,
      },
    });

    return { message: 'Password reset OTP sent to your email' };
  }

  async resetPasswordWithOtp(email: string, otp: string, newPassword: string):Promise<{ message: string }>{
    const user = await this.userModel.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: new Date() }, // Ensure OTP has not expired
    });

    if (!user) {
      throw new Error('Invalid or expired OTP');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();
    return { message: 'Password reset successful' };

  }

  async validateOtp(email: string, otp: string): Promise<boolean> {
    // Find the user by email
    const user = await this.userModel.findOne({ email });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    // Check if the OTP matches and is not expired
    if (
      user.resetPasswordOtp === otp &&
      user.resetPasswordOtpExpires > new Date()
    ) {
      return true;
    }
  
    return false;
  }
  
 /* async unlockPlace(userId: string, placeId: string) {
    const user = await this.userModel.findById(userId);
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Vérification si l'utilisateur a déjà débloqué ce lieu
    if (user.unlockedPlaces.includes(placeId)) {
      throw new BadRequestException('Place already unlocked');
    }
  
    // Vérification si l'utilisateur a suffisamment de coins
    if (user.coins < 5) {
      throw new BadRequestException('Not enough coins to unlock this place');
    }
 



    // Déduction de 5 coins
    user.coins -= 5;
    console.log(`Coins after deduction: ${user.coins}`); // Log pour vérifier la déduction
  
    // Ajout du lieu débloqué
    user.unlockedPlaces.push(placeId);
  
    // Sauvegarder les modifications de l'utilisateur
    await user.save();
  
    console.log(`User's unlocked places: ${user.unlockedPlaces}`); // Log pour vérifier l'ajout du lieu
  
    return { message: 'Place unlocked successfully', coinsRemaining: user.coins };
  }*/
 
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
  
}
