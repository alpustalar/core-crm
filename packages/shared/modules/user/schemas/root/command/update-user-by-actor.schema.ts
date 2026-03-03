import { z } from "zod";
import { CreateUserSchema } from "@shared/modules";
import { UserStatusSchema } from "@shared/generated-zod";

export const UpdateUserByActorSchema = z.lazy(() =>
  CreateUserSchema.partial().extend({
    roleId: z.uuid({ message: "Geçersiz Role ID formatı" }).optional(),
    status: UserStatusSchema.optional(),
    picture: z.url({ message: "Geçersiz resim bağlantısı" }).optional(),
    clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }).optional(),
    managedClinicIds: z
      .array(z.uuid({ message: "Dizi içindeki Klinik ID geçersiz formatta" }))
      .optional(),
    ownedOrganizationIds: z
      .array(
        z.uuid({ message: "Dizi içindeki Organizasyon ID geçersiz formatta" }),
      )
      .optional(),
  }),
);
