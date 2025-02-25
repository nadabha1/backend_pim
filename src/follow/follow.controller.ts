import { Controller, Post, Delete, Get, Param, Body, ConflictException } from '@nestjs/common';
import { FollowService } from './follow.service';

@Controller('follow')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post()
  async follow(@Body() body: { follower: string; following: string }) {
    try {
      return await this.followService.followUser(body.follower, body.following);
    } catch (error) {
      if (error instanceof ConflictException) {
        return { message: "Already following this user." };
      }
      throw error;
    }
  }

  @Delete()
  async unfollow(@Body() body: { follower: string; following: string }) {
    return this.followService.unfollowUser(body.follower, body.following);
  }
  // ✅ Get number of followers
  @Get('followers/count/:userId')
  async getFollowersCount(@Param('userId') userId: string) {
    const count = await this.followService.getFollowersCount(userId);
    console.log('followers'+count);
    return { followersCount: count };
  }

  // ✅ Get number of users a person is following
  @Get('following/count/:userId')
  async getFollowingCount(@Param('userId') userId: string) {
    const count = await this.followService.getFollowingCount(userId);
    console.log('followingggg'+count);
    return { followingCount: count };
  }

  // ✅ Get list of followers
  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    const followers = await this.followService.getFollowers(userId);
    console.log(userId+' is following'+followers)
    return { followers };
  }

  // ✅ Get list of following
  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    const following = await this.followService.getFollowing(userId);
    console.log(userId+' is following'+following)
    return { following };
  }
}
