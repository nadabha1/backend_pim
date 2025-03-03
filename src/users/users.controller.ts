import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Preference } from 'src/preferences/entities/preference.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
 
  @Post('register')
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads', // Dossier où enregistrer les fichiers
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`); // Générer un nom unique
        },
      }),
    }),
  )
  /*async register(@Body() user: Partial<User>, @UploadedFile() file: Express.Multer.File): Promise<User> {
    if (file) {
      user.profileImage = `/uploads/${file.filename}`;
    }
    return this.usersService.create(user);
  }*/
    async register(@Body() body: { user: Partial<User>; preferences: Partial<Preference> }): Promise<User> {
      if (!body.user || !body.user.password) {
        throw new Error("User data is missing or incomplete");
      }
      return this.usersService.create(body.user, body.preferences);
    }

  @Get('all')  
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();  // Appelle la méthode dans le service
  }
  
  @Get(':id')
  @UseGuards(AuthGuard)
  async findById(@Param('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }
  @Post('checkverification')
  async checkVerification(@Body('email') email: string) {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
          return { isVerified: false }; // ❌ Prevent undefined errors
      }
  
      console.log('🔍 Checking verification for ${email}: ${user.isVerified}');
  
      return { isVerified: user.isVerified }; // ✅ Ensure this returns HTTP 200
  }
  @Put(':id/update')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('profilePicture', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async updateProfile(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    if (file) {
      updateData.profileImage = `/uploads/${file.filename}`;
    }
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteAccount(@Param('id') id: string): Promise<string> {
    await this.usersService.delete(id);
    return 'Account deleted successfully';
  }
  @Put(':userId/unlock/:placeId')
  async unlockPlace(
    @Param('userId') userId: string,
    @Param('placeId') placeId: string,
  ) {
    return this.usersService.unlockPlace(userId, placeId);
  }

  @Get(':userId/unlocked-places')
async getUnlockedPlaces(@Param('userId') userId: string) {
  return this.usersService.getUnlockedPlaces(userId);
}


}
