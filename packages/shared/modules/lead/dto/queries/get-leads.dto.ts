import { createZodDto } from 'nestjs-zod';
import { GetLeadsSchema } from '../../schemas/queries';

export class GetLeadsDto extends createZodDto(GetLeadsSchema) {}
