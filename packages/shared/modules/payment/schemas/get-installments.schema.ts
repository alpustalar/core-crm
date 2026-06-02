import { z } from 'zod';

export const GetInstallmentsSchema = z.object({
  binNumber: z
    .string()
    .min(6, { message: 'BIN numarası en az 6 karakter olmalıdır' })
    .max(8, { message: 'BIN numarası en fazla 8 karakter olabilir' }),

  /** Query string'den geldiği için coerce ile sayıya dönüştürülür */
  price: z.coerce
    .number({ message: 'price geçerli bir sayı olmalıdır' })
    .positive({ message: 'price sıfırdan büyük olmalıdır' }),
});
