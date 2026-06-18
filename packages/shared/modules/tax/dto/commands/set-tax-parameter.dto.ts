import { createZodDto } from 'nestjs-zod';
import { SetTaxParameterSchema } from '../../schemas/commands';

export class SetTaxParameterDto extends createZodDto(SetTaxParameterSchema) {}
