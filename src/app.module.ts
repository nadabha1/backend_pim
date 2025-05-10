import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { CarnetModule } from './carnet/carnet.module';
import { FollowModule } from './follow/follow.module';
import { Preference } from './preferences/entities/preference.entity';
import { PreferencesModule } from './preferences/preferences.module';
import { ReviewModule } from './review/review.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './upload/upload.module';
import { MessageModule } from './message/message.module';
import { ConversationModule } from './conversation/conversation.module';
import { EventModule } from './event/event.module';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { AiModule } from './ai/ai.module';
import { AnalyseIaModule } from './analyse-ia/analyse-ia.module';
import { UserEvent } from './user-event/entities/user-event.entity';
import { UserEventModule } from './user-event/user-event.module';
import { MatchingModule } from './matching/matching.module';
import { AgoraModule } from './agora/agora.module';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // Serve files from 'uploads' directory
      serveRoot: '/uploads', // URL prefix for accessing files
    }),
    MongooseModule.forRoot('mongodb://localhost/nestjs_app'),
    UsersModule,
    AuthModule,
    CarnetModule,
    FollowModule,
    PreferencesModule,
    ReviewModule,
    UploadModule,
    MessageModule,
    ConversationModule,
    EventModule,
    ChatModule,
    AiModule,
    AnalyseIaModule,
    UserEventModule,
    MatchingModule,
    AgoraModule,
    
    
  ],  controllers: [AppController],
  providers: [AppService,ChatGateway],
  
})
export class AppModule {}
