import { z } from 'zod';
import { CreateClinicSchema } from '@shared/modules/clinic/schemas';
import { RegisterUserOrProviderAccountSchema } from '@shared/modules/user/schemas/commands';

export const RegisterClinicAccountSchema = z.object({
  clinic: CreateClinicSchema.omit({ organizationId: true }),
  owner: RegisterUserOrProviderAccountSchema.omit({ roleId: true, organizationId: true, clinicId: true, providerProfile: true }),
});
