import { createZodDto } from 'nestjs-zod';
import { UpsertPlanSchema } from '../../schemas/commands';

export class UpsertPlanDto extends createZodDto(UpsertPlanSchema) {}
