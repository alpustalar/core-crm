import { z } from 'zod';
import { AccountSideSchema } from '@input-type-schemas/AccountSideSchema';
import { AccountTypeSchema } from '@input-type-schemas/AccountTypeSchema';

// ==========================================
// ACCOUNT (HESAP PLANI) SÖZLEŞMELERİ
// ==========================================

export const CreateAccountSchema = z.object({
  id: z.uuid().optional(),
  clinicId: z.uuid(),
  organizationId: z.uuid(),
  code: z.string().min(1, 'Hesap kodu zorunludur'), // Örn: "100.01.001"
  name: z.string().min(1, 'Hesap adı zorunludur'), // Örn: "Kasa Hesabı"
  parentId: z.uuid().nullable().optional(),

  type: AccountTypeSchema,
  normalSide: AccountSideSchema, // Borç/Alacak (Debit/Credit) çalışma yönü

  isPostable: z.boolean().optional(),
  requiresParty: z.boolean().optional(),
  currency: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateAccountProps = z.infer<typeof CreateAccountSchema>;
