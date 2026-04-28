import { z } from "zod";

export const ConvertUserToDoctorSchema = z.object({
  userId: z.string(),
  title: z.uuid(),
  specialty: z.uuid(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: "Geçersiz e-posta formatı" }).optional(),
  isActive: z.coerce.boolean().default(true),
  clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }),
});
