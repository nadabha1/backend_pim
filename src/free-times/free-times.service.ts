import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFreeTimeDto } from './dto/create-free-time.dto';
import { UpdateFreeTimeDto } from './dto/update-free-time.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FreeTime } from './entities/free-time.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class FreeTimeService {
  constructor(@InjectModel(FreeTime.name) private freeTimeModel: Model<FreeTime>) {}

 /* async createFreeTime(userId: string, start: Date, end: Date): Promise<FreeTime> {
    // Validate if userId is a valid ObjectId (24 characters)
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    // Convert to ObjectId if necessary
    const userObjectId = new Types.ObjectId(userId);

    return this.freeTimeModel.create({ userId: userObjectId, start, end });
  }*/
   
    async createFreeTime(userId: string, start: string, end: string): Promise<FreeTime> {
      // Validate if userId is a valid ObjectId (24 characters)
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid userId format');
      }
  
      // Parse start and end as Date objects
      const parsedStart = new Date(start);
      const parsedEnd = new Date(end);
  
      // Validate that start and end are valid dates
      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        console.error(`Invalid date format: start=${start}, end=${end}`);
        throw new BadRequestException('Invalid date format for start or end');
      }
  
      console.log(`Creating free time: userId=${userId}, start=${parsedStart}, end=${parsedEnd}`);
  
      // Convert to ObjectId if necessary
      const userObjectId = new Types.ObjectId(userId);
  
      return this.freeTimeModel.create({ userId: userObjectId, start: parsedStart, end: parsedEnd });
    }

  async getFreeTimeByUser(userId: string): Promise<FreeTime[]> {
    // Validate if userId is a valid ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId format');
    }

    const userObjectId = new Types.ObjectId(userId);
    return this.freeTimeModel.find({ userId: userObjectId }).exec();
  }

  async deleteFreeTimesByUser(userId: string): Promise<void> {
    await this.freeTimeModel.deleteMany({ userId }).exec();
  }
}