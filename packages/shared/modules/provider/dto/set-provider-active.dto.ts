import { createZodDto } from 'nestjs-zod';
import { SetProviderActiveSchema } from '../schemas/set-provider-active.schema';

export class SetProviderActiveDto extends createZodDto(SetProviderActiveSchema) {}
