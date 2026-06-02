import { z } from 'zod';
import { GetOrganizationAppointmentsSchema } from '@shared/modules/index';

export type GetOrganizationAppointments = z.infer<
  typeof GetOrganizationAppointmentsSchema
>;
