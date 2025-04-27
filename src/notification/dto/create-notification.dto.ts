import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType, NotificationCategory } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory = NotificationCategory.SOCIAL;

  @IsOptional()
@IsString()
title?: string;



  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  sender: string;

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsOptional()
  data?: Record<string, string>;
}
