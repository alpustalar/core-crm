import { createZodDto } from 'nestjs-zod';
import { SetPlanModulesSchema } from '../../schemas/commands';

export class SetPlanModulesDto extends createZodDto(SetPlanModulesSchema) {}
