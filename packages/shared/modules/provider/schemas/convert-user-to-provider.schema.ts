import { z } from "zod";
import OperationModeSchema from '@shared/generated-zod/inputTypeSchemas/OperationModeSchema';

export const ConvertUserToProviderSchema = z.object({
  userId: z.string(),
  titleId: z.uuid(),
  specialtyId: z.uuid(),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: "Geçersiz e-posta formatı" }).optional(),
  isActive: z.coerce.boolean().default(true),
  clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }),
  operationMode: OperationModeSchema,
  canAcceptExamination: z.coerce.boolean().default(true)
});
