import { createZodDto } from 'nestjs-zod';
import { SearchHotelsSchema } from '../../schemas/queries';

export class SearchHotelsDto extends createZodDto(SearchHotelsSchema) {}
