import { createZodDto } from 'nestjs-zod';
import { CreateProviderShiftSchema } from '../schemas/create-provider-shift.schema';

export class CreateProviderShiftDto extends createZodDto(CreateProviderShiftSchema) {}
