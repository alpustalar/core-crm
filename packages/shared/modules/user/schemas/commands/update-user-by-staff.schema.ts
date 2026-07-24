import { z } from 'zod';
import { RegisterUserOrProviderAccountSchema } from '@shared/modules/registration/schemas/commands/register-user-or-provider-account.schema';
import { GlobalStatusSchema } from '@shared/generated-zod';

export const UpdateUserByStaffSchema = z.lazy(() =>
  RegisterUserOrProviderAccountSchema.omit({ providerProfile: true }).partial().extend({
    status: GlobalStatusSchema.optional(),
    managedClinicIds: z
      .array(z.uuid({ message: 'Dizi içindeki Klinik ID geçersiz formatta' }))
      .optional(),
    ownedOrganizationIds: z
      .array(
        z.uuid({ message: 'Dizi içindeki Organizasyon ID geçersiz formatta' })
      )
      .optional(),
  })
);
