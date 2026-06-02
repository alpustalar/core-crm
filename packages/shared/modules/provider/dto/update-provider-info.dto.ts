import { createZodDto } from 'nestjs-zod';
import { UpdateProviderInfoSchema } from '../schemas/update-provider-info.schema';

export class UpdateProviderInfoDto extends createZodDto(UpdateProviderInfoSchema) {}
