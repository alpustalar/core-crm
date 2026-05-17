import { z } from "zod";

export const CheckEmailSchema = z.object({
  email: z.email({ message: "Geçersiz e-posta formatı" }).trim().toLowerCase(),
});
