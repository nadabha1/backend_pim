// src/common/pipes/parse-object-id.pipe.ts

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value) || value.length !== 24) {
      throw new BadRequestException(`Invalid ObjectId: ${value}. It must be a 24-character hex string.`);
    }
    return new Types.ObjectId(value);
  }
}
