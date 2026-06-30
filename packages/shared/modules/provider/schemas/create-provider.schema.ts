import { z } from "zod";

const OperationModeSchema = z.enum(["STATIC", "SHIFT"]);

export const CreateProviderSchema = z.object({
  userId: z.uuid(),
  clinicId: z.uuid(),
  providerTitleId: z.uuid().optional(),
  providerSpecialtyId: z.uuid().optional(),
  sectorId: z.uuid().optional(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: "Geçersiz e-posta formatı" }).optional(),
  isActive: z.coerce.boolean().default(true),
  acceptsConsultation: z.coerce.boolean().default(true),
  operationMode: OperationModeSchema.default("STATIC"),
});
