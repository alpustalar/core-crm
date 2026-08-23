import { z } from 'zod';

/**
 * Klinik finans özeti tarih aralığı. Controller iki ayrı `@Query('dateFrom')` /
 * `@Query('dateTo')` string'i alıp `DateTimeManager.create` ile çözüyor; burada
 * ISO string olarak taşınır.
 *
 * `clinicId` yok — o yolun parçası (`finance-ledger/clinic/:clinicId/summary`).
 */
export const GetLedgerSummarySchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
