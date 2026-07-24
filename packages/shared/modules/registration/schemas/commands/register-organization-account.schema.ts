import { z } from 'zod';
import { CreateOrganizationSchema } from '@shared/modules/organization/schemas';
import { RegisterUserOrProviderAccountSchema } from '@shared/modules/user/schemas/commands';
import { CreateClinicSchema } from '@shared/modules/clinic/schemas';

export const RegisterOrganizationAccountSchema = z.object({
  organization: CreateOrganizationSchema,
  clinic: CreateClinicSchema,
  owner: RegisterUserOrProviderAccountSchema.omit({ roleId: true, organizationId: true, clinicId: true }),
});
