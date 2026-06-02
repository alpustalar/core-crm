import { createZodDto } from 'nestjs-zod';
import { UpdatePatientPackageSchema } from '../../schemas/command';

export class UpdatePatientPackageDto extends createZodDto(UpdatePatientPackageSchema) {}
