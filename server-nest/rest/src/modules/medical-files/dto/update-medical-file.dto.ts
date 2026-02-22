import { PartialType } from '@nestjs/swagger';
import { CreateMedicalFileDto } from './create-medical-file.dto';

export class UpdateMedicalFileDto extends PartialType(CreateMedicalFileDto) {}
