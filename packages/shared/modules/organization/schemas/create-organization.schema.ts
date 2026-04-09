import { z } from "zod";

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, { message: "Organizasyon adı boş bırakılamaz" }),
  phone: z.string().optional(),
  email: z.email({ message: "Geçersiz e-posta formatı" }).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
});
