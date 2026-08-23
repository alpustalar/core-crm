import { z } from 'zod';

/**
 * `module:action` biçimi kapıda zorlanır. Aksi hâlde serbest metin veritabanına
 * kadar iner ve "yetki var mı" karşılaştırmaları sessizce kaçırır.
 */
export const CapabilityKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*:(create|read|update|delete)$/,
    'Yetki biçimi "modul:eylem" olmalıdır (ör. patient:read)'
  );

export const GrantUserCapabilitySchema = z.object({
  capability: CapabilityKeySchema,
  /** Yöneticinin gerekçesi — denetimde "bu yetki neden verilmiş" sorusunu yanıtlar. */
  reason: z.string().trim().min(1).max(280).optional(),
});
