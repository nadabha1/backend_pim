import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    console.log('✅ FACEBOOK_CLIENT_ID:', configService.get<string>('FACEBOOK_CLIENT_ID')); // DEBUG

    super({
      clientID: configService.get<string>('FACEBOOK_CLIENT_ID'),
      clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL'),
      profileFields: ['id', 'displayName', 'photos', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('✅ Facebook Profile:', profile);
    
    return {
      facebookId: profile.id,
      name: profile.displayName,
      email: profile.emails?.[0]?.value ?? null,
      picture: profile.photos?.[0]?.value ?? null,
    };
  }
}
