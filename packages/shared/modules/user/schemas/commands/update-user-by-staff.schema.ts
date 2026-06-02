import { z } from 'zod';

import { CreateUserSchema } from '@shared/modules/user/schemas/commands/create-user.schema';
import { GlobalStatusSchema } from '@shared/generated-zod';

export const UpdateUserByActorSchema = z.lazy(() =>
  CreateUserSchema.omit({ providerProfile: true }).partial().extend({
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
