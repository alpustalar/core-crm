import { QueryResponse } from '@shared/common/response/response.interface';

/** Hekim bazında tahsil edilmiş ciro satırı (hekim adı çağırana ait). */
export interface ProviderRevenueLine {
  providerId: string | null; // null = atanmamış ödemeler
  collected: string; // tahsil edilmiş toplam
  count: number; // tahsil edilen taksit adedi
}

export interface ProviderRevenueReport {
  clinicId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  lines: ProviderRevenueLine[]; // ciro azalan sırada
  totalCollected: string;
}

export type GetProviderRevenueResponse = QueryResponse<ProviderRevenueReport>;
