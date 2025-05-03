import { Controller, Post, Body, UnauthorizedException, Param, Get, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { join } from 'path';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly usersService: UsersService)
     {}
     @Post('forgot-password')
     async forgotPassword(@Body('email') email: string): Promise<string> {
      console.log('Received email for password reset:', email);
       return this.usersService.forgotPassword(email);
     }
      @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    const user = await this.authService.validateUser(loginData.email, loginData.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

 
  @Post('reset-password-with-otp')
  async resetPasswordWithOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('password') newPassword: string
  ): Promise<string> {
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
@Get('confirm/:id')
  async confirmEmail(@Param('id') id: string, @Res() res: Response, @Req() req: Request) {
      const user = await this.usersService.verifyUserEmail(id);
      if (!user) {
          return res.status(400).send("Invalid verification link");
      }
  
      console.log('✅ User ${id} verified. Redirecting...');
  
      const userAgent = req.headers['user-agent'] || "";

      console.log('✅ User ${id} verified. Redirecting to email-verified page...');
       // ✅ Convert _id to a string explicitly
    const userId = user._id.toString();

    await this.usersService.update(userId, { isVerified: true });

      // ✅ Serve the email-verified.html file
      return res.sendFile(join(__dirname, '..', '..', 'templates', 'email-verified.html'));

  }
  



}