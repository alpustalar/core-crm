import { createZodDto } from 'nestjs-zod';
import { SetProviderOperationModeSchema } from '../schemas/set-provider-operation-mode.schema';

export class SetProviderOperationModeDto extends createZodDto(SetProviderOperationModeSchema) {}
