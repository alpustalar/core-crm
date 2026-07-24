import { z } from 'zod';
import { CheckAppointmentConflictsSchema } from '../../schemas/queries/check-appointment-conflicts.schema';

export type CheckAppointmentConflicts = z.infer<
  typeof CheckAppointmentConflictsSchema
>;
