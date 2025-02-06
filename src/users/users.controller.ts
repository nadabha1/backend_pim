import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() user: Partial<User>): Promise<User> {
    return this.usersService.create(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Put(':id/update')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteAccount(@Param('id') id: string): Promise<string> {
    await this.usersService.delete(id);
    return 'Account deleted successfully';
  }
}
