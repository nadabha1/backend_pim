import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @IsOptional()
  @IsString()
  address?: string; // Optional textual address

  @IsNumber()
  lat: number; // Latitude (required for AR)

  @IsNumber()
  lng: number; // Longitude (required for AR)

  @IsOptional()
  @IsNumber()
  heading?: number; // Compass bearing for AR alignment (0-360°)
}