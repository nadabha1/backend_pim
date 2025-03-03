import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePreferenceDto {
  @IsString()
  user: string;  // ID de l'utilisateur (en ObjectId)

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other', 'Prefer not to declare'])
  gender?: string;

  @IsOptional()
  @IsArray()
  favoriteActivities?: string[];

  @IsOptional()
  @IsArray()
  eventPreferences?: string[];

  @IsOptional()
  @IsEnum(['Solo', 'Small Groups', 'Large Groups'])
  socialPreference?: string;

  @IsOptional()
  @IsEnum(['Morning', 'Afternoon', 'Evening', 'No Preference'])
  preferredEventTime?: string;
}
