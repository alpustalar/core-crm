import { z } from "zod";
import {
  DoctorSpecialtySchema,
  DoctorTitleSchema,
} from "@shared/generated-zod";

export const CreateDoctorSchema = z.object({
  title: DoctorTitleSchema.optional(),
  specialty: z.lazy(() => DoctorSpecialtySchema),
  publicPhone: z.string().optional(),
  publicEmail: z.email({ message: "Geçersiz e-posta formatı" }).optional(),
  isActive: z.coerce.boolean().default(true),
  clinicId: z.uuid({ message: "Geçersiz Klinik ID formatı" }),
});
