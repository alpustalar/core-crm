import { createZodDto } from 'nestjs-zod';
import { GetMetaLeadsSchema } from '../../schemas/queries';

export class GetMetaLeadsDto extends createZodDto(GetMetaLeadsSchema) {}
