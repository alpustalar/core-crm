import { z } from 'zod';

/**
 * Fatura listesi filtresi.
 *
 * `organizationId` **zorunlu**: controller onu `ParseUUIDPipe` ile alıyor
 * (`@Query('organizationId', ParseUUIDPipe)`), yani gönderilmezse 400 döner.
 * Aktörün organizasyonu bağlamda zaten var ama uç bunu ayrıca istiyor —
 * sözleşme uydurmak yerine olduğu gibi yansıtılıyor.
 */
export const GetInvoicesSchema = z.object({
  organizationId: z.uuid(),
  clinicId: z.uuid().optional(),
});
