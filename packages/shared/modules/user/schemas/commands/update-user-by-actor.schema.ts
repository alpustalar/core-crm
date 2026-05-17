import { z } from "zod";
import { CreateUserSchema } from "@shared/modules/index";
import { UserStatusSchema } from "@shared/generated-zod";

export const UpdateUserByActorSchema = z.lazy(() =>
  CreateUserSchema.partial().extend({
    titleId: z.uuid().optional(),
    specialtyId: z.uuid().optional(),
    roleId: z.uuid({ message: "Geçersiz Role ID formatı" }).optional(),
    clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }).optional(),
    status: UserStatusSchema.optional(),
    picture: z.url({ message: "Geçersiz resim bağlantısı" }).optional(),
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
