import { z } from "zod";

export const SendUserPasswordResetByActorSchema = z.object({
  id: z.string().min(1, { message: "ID alanı boş bırakılamaz" }),
  clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }),
});
