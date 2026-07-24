import { createZodDto } from 'nestjs-zod';
import { CheckAppointmentConflictsSchema } from '@shared/modules/appointment/schemas/queries/check-appointment-conflicts.schema';

export class CheckAppointmentConflictsDto extends createZodDto(
  CheckAppointmentConflictsSchema
) {}
