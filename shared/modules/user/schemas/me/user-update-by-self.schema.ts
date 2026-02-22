import { z } from "zod";

export const UserUpdateBySelfSchema = z.object({
  displayName: z
    .string()
    .min(2, { message: "İsim en az 2 karakter olmalıdır" })
    .optional(),

  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, {
      message: "Geçersiz telefon numarası formatı",
    })
    .optional(),

  picture: z.url({ message: "Geçersiz profil resmi bağlantısı" }).optional(),
});
