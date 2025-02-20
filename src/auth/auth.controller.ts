import { Controller, Post, Body, UnauthorizedException, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginData.email, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    return this.usersService.forgotPassword(email);
  }
  @Post('reset-password-with-otp')
  async resetPasswordWithOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('password') newPassword: string,
  ): Promise<{ message: string }> {
    return this.usersService.resetPasswordWithOtp(email, otp, newPassword);
  }

  @Post('verify-otp')
async verifyOtp(
  @Body('email') email: string,
  @Body('otp') otp: string,
): Promise<{ message: string }> {
  const isValid = await this.usersService.validateOtp(email, otp);
  if (!isValid) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }
  return { message: 'OTP verified successfully' };
}
  @Post('facebook')
  async facebookLogin(@Body('access_token') accessToken: string) {
    try {
      // 🔥 Validate Access Token with Facebook API
      const { data } = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
      );

      if (!data.id) {
        throw new UnauthorizedException('Invalid Facebook Token');
      }

      // ✅ Here you can create/find the user in the database
      const user = {
        facebookId: data.id,
        name: data.name,
        email: data.email,
        picture: data.picture?.data?.url,
      };

      // ✅ Return User Data (In real case, generate JWT Token)
      return {
        message: 'Facebook Login Successful',
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Error validating Facebook Token');
    }
  
}



}
