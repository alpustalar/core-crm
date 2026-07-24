import { createZodDto } from 'nestjs-zod';
import { GetRoiReportSchema } from '../../schemas/queries';

export class GetRoiReportDto extends createZodDto(GetRoiReportSchema) {}
