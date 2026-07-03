import { z } from 'zod';
import PosProviderSchema from '@shared/generated-zod/inputTypeSchemas/PosProviderSchema';

/**
 * POS cihazı kaydı. `provider` gönderilmezse PAX varsayılır (geriye dönük uyum).
 * Sağlayıcıya göre koşullu zorunluluk `superRefine` ile uygulanır (discriminated union,
 * createZodDto'nun union-olmayan çıktı kısıtı nedeniyle burada kullanılamaz):
 *  - PAX (POSLINK/TCP): terminalId, merchantId, host, port zorunlu.
 *  - IYZICO_TERMINAL (Host API): deviceUniqueId zorunlu.
 */
export const RegisterPosDeviceSchema = z
  .object({
    clinicId: z.uuid(),
    label: z.string().min(1, 'POS cihazı etiketi zorunludur'),
    provider: PosProviderSchema.default(PosProviderSchema.enum.PAX),
    // PAX (POSLINK/TCP) — provider = PAX iken zorunlu.
    terminalId: z.string().min(1).optional(),
    merchantId: z.string().min(1).optional(),
    host: z.string().min(1).optional(),
    port: z.number().int().positive().optional(),
    // iyzico Terminal (Host API) — provider = IYZICO_TERMINAL iken zorunlu.
    deviceUniqueId: z.string().min(1).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.provider === PosProviderSchema.enum.PAX) {
      if (!val.terminalId)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['terminalId'],
          message: 'PAX için Terminal ID zorunludur',
        });
      if (!val.merchantId)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['merchantId'],
          message: 'PAX için Merchant ID (Üye İşyeri No) zorunludur',
        });
      if (!val.host)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['host'],
          message: 'PAX için Host adresi zorunludur',
        });
      if (val.port == null)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['port'],
          message: 'PAX için port numarası zorunludur',
        });
    } else if (!val.deviceUniqueId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deviceUniqueId'],
        message: 'iyzico için Terminal cihaz benzersiz kimliği zorunludur',
      });
    }
  });
