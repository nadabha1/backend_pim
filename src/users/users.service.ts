import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
 
  constructor(@InjectModel(User.name) private userModel: Model<User>
,    private readonly mailerService: MailerService,
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
  
  
}
