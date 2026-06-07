import { createZodDto } from 'nestjs-zod';
import { FindAdminRequestsSchema } from '../../schemas/queries';

export class FindAdminRequestsDto extends createZodDto(FindAdminRequestsSchema) {}
