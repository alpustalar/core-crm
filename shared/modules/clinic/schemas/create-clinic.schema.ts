import { z } from "zod";
import { GlobalStatusSchema } from "@shared/generated-zod";

export const CreateClinicSchema = z.object({
  name: z
    .string()
    .min(2, { message: "İsim en az 2 karakter olmalıdır" })
    .max(100, { message: "İsim en fazla 100 karakter olabilir" }),

  phone: z
    .string()
    .min(7, { message: "Telefon numarası çok kısa" })
    .max(20, { message: "Telefon numarası çok uzun" })
    .optional(),

  email: z.email({ message: "Geçersiz e-posta formatı" }).optional(),

  address: z
    .string()
    .min(5, { message: "Adres çok kısa" })
    .max(500, { message: "Adres çok uzun" })
    .optional(),

  city: z
    .string()
    .min(2, { message: "Şehir ismi çok kısa" })
    .max(50, { message: "Şehir ismi çok uzun" })
    .optional(),

  district: z
    .string()
    .min(2, { message: "İlçe ismi çok kısa" })
    .max(50, { message: "İlçe ismi çok uzun" })
    .optional(),

  status: GlobalStatusSchema.optional(),

  timezone: z.string().optional(),

  organizationId: z
    .uuid({ message: "Geçersiz organizasyon ID formatı" })
    .optional(),
});
