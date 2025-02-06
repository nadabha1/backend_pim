import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Replace with your SMTP host
        port: 587,               // Replace with your SMTP port
        secure: false,           // Set to `true` if using SSL
        auth: {
          user: 'ribd1920@gmail.com',
          pass: 'otpd ybir gpwb avzp',  // SMTP password
        },
      },
      defaults: {
        from: '"PIM " <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'), // Adjusted for runtime
        adapter: new HandlebarsAdapter(), // Use Handlebars for email templates
        options: {
          strict: true,
        },
      },
    }),
    MongooseModule.forRoot('mongodb://localhost/nestjs_app'),
    UsersModule,
    AuthModule,
  ],  controllers: [AppController],
  providers: [AppService],
  
})
export class AppModule {}
