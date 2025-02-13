import { PartialType } from '@nestjs/mapped-types';
import { CreateCarnetDto } from './create-carnet.dto';

export class UpdateCarnetDto extends PartialType(CreateCarnetDto) {}
