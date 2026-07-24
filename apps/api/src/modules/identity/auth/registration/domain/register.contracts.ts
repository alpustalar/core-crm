import { z } from 'zod';

export const RegisterUserOrProviderInternalRelationsSchema = z.object({
  ownedOrganizationIds: z.array(z.uuid()).optional(),
  managedClinicIds: z.array(z.uuid()).optional(),
});

export type RegisterUserOrProviderInternalRelations = z.infer<
  typeof RegisterUserOrProviderInternalRelationsSchema
>;
