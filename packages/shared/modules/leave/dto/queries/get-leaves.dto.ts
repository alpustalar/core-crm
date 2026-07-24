import { createZodDto } from 'nestjs-zod';
import { GetLeavesFilterSchema } from '../../schemas/queries';

export class GetLeavesFilterDto extends createZodDto(GetLeavesFilterSchema) {
}
