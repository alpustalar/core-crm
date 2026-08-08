import { createZodDto } from 'nestjs-zod';
import { GetWorkOrdersSchema } from '../../schemas/queries';

export class GetWorkOrdersFilterDto extends createZodDto(GetWorkOrdersSchema) {}
