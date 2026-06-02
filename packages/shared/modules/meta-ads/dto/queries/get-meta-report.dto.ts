import { createZodDto } from 'nestjs-zod';
import { GetMetaReportSchema } from '../../schemas/queries';

export class GetMetaReportDto extends createZodDto(GetMetaReportSchema) {}
