import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow, FollowDocument } from './entities/follow.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { NotificationGateway } from 'src/notification/socket.gateway';
import { NotificationType } from 'src/notification/entities/notification.entity';

@Injectable()
export class FollowService {
  constructor( @InjectModel(User.name) private userModel: Model<UserDocument> ,
  @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
    private readonly socketGateway: NotificationGateway, // ✅ Injection du WebSocket Gateway
) {}

  // 🔹 Follow a user
  async followUser(followerId: string, followingId: string): Promise<any> {
    if (followerId === followingId) {
      throw new BadRequestException("You can't follow yourself!");
    }
  
    const followExists = await this.followModel.findOne({ follower: followerId, following: followingId });
    if (followExists) {
      throw new ConflictException('Already following this user.');
    }
  
    const newFollow = new this.followModel({ follower: followerId, following: followingId });
    await newFollow.save();
    this.socketGateway.sendNotification({
            senderId: followerId,
            recipientId: followingId.toString(),
            type: NotificationType.FOLLOW,
            content: 'Guess what? You’ve got a new follower!',
            data: { followerId: followerId.toString() },
          });
    return { message: 'Follow successful' };
  }
  

  // 🔹 Unfollow a user
  async unfollowUser(followerId: string, followingId: string): Promise<any> {
    const follow = await this.followModel.findOneAndDelete({ follower: followerId, following: followingId });
  
    if (!follow) {
      throw new NotFoundException("You are not following this user.");
    }
  
    return { message: 'Unfollow successful' };
  }
  

  async getFollowersCount(userId: string): Promise<number> {
    return await this.followModel.countDocuments({ following: userId });
  }

  // ✅ Get following count for a user
  async getFollowingCount(userId: string): Promise<number> {
    return await this.followModel.countDocuments({ follower: userId });
  }

  // ✅ Get list of followers (returning IDs)
  async getFollowers(userId: string): Promise<string[]> {
    const followers = await this.followModel.find({ following: userId });
    return followers.map((f) => f.follower.toString());  // Convert ObjectId to string
  }

  

  // ✅ Get list of following (returning IDs)
  async getFollowing(userId: string): Promise<string[]> {
    const following = await this.followModel.find({ follower: userId });
    return following.map((f) => f.following.toString());  // Convert ObjectId to string
  }
  async getUserWithFollowStats(userId: string) {
    const followers = await this.followModel.countDocuments({ following: userId });
    const following = await this.followModel.countDocuments({ follower: userId });

    const user = await this.userModel.findById(userId).lean();
    return {
      ...user,
      followersCount: followers,
      followingCount: following,
    };
  }

  async deleteFollowRelationsByUser(userId: string): Promise<void> {
    // Supprimer les relations où l'utilisateur est un follower
    await this.followModel.deleteMany({ follower: userId }).exec();

    // Supprimer les relations où l'utilisateur est un following
    await this.followModel.deleteMany({ following: userId }).exec();
  }
}
