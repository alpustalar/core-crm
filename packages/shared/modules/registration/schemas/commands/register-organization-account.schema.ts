import { z } from 'zod';
import { CreateOrganizationSchema } from '@shared/modules/organization/schemas';
import { CreateUserSchema } from '@shared/modules/user/schemas/commands';

export const RegisterOrganizationAccountSchema = z.object({
  organization: CreateOrganizationSchema,
  owner: CreateUserSchema.omit({ roleId: true, organizationId: true, clinicId: true, providerProfile: true }),
});
