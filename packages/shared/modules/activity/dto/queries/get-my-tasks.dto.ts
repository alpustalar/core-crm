import { createZodDto } from 'nestjs-zod';
import { GetMyTasksSchema } from '../../schemas/queries';

export class GetMyTasksDto extends createZodDto(GetMyTasksSchema) {}
