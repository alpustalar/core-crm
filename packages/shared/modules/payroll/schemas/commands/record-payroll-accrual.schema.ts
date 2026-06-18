import { z } from 'zod';

/**
 * Bordro tahakkuku — hesaplanmış (brüt→net) rakamlar dışarıdan gelir; finans yalnız
 * tahakkuk fişini üretir (doc 05 §2.9). Denge özdeşliği:
 * grossSalary + employerSgk = netPayable + taxWithholding + (employeeSgk + employerSgk).
 */
export const RecordPayrollAccrualSchema = z.object({
  employeeUserId: z.string().uuid(),
  /** Tahakkuk tarihi; muhasebe dönemini ve dedupe ay anahtarını belirler. */
  accrualDate: z.coerce.date(),
  grossSalary: z.number().nonnegative(), // brüt ücret
  employerSgk: z.number().nonnegative(), // işveren SGK payı
  netPayable: z.number().nonnegative(), // personele net ödenecek
  taxWithholding: z.number().nonnegative(), // GV stopajı + damga
  employeeSgk: z.number().nonnegative(), // işçi SGK kesintisi
});
