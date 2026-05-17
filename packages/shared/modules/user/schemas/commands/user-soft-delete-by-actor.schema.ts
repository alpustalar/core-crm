import { z } from "zod";
import { RoleSchema } from "../../../../generated-zod";

export const UserSoftDeleteByActorSchema = z.object({
  userId: z.string().min(1, { message: "ID alanı boş bırakılamaz" }),
  clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }),
  role: RoleSchema,
});
