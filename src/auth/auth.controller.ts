import { Controller, Post, Body, UnauthorizedException, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

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




}
