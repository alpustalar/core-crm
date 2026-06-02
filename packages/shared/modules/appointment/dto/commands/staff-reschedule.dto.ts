import { createZodDto } from 'nestjs-zod';
import { StaffRescheduleSchema } from '@shared/modules/appointment/schemas/command/index';

export class StaffRescheduleDto extends createZodDto(StaffRescheduleSchema) {}
