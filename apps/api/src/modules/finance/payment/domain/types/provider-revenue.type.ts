import { Prisma } from '@prisma/client';

/** Hekim bazında ciro sorgusu — şube bazlı, opsiyonel tahsilat (paidAt) aralığı. */
export interface ProviderRevenueFilter {
  clinicId: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Tahsil edilmiş tek taksitin hekim boyutu — gruplama için ham veri. */
export interface CollectedInstallmentRow {
  providerId: string | null; // null = ödeme bir hekime atanmamış
  amount: Prisma.Decimal;
}
