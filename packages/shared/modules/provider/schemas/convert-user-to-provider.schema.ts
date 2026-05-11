import { z } from "zod";

export const ConvertUserToProviderSchema = z.object({
  userId: z.string(),
  titleId: z.uuid(),
  specialtyId: z.uuid(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: "Geçersiz e-posta formatı" }).optional(),
  isActive: z.coerce.boolean().default(true),
  clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }),
});
