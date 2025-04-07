import { PartialType } from '@nestjs/mapped-types';
import { CreateAnalyseIaDto } from './create-analyse-ia.dto';

export class UpdateAnalyseIaDto extends PartialType(CreateAnalyseIaDto) {}
