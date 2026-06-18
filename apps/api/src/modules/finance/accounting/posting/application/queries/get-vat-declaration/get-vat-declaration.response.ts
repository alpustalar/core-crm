import { QueryResponse } from '@shared/common/response/response.interface';

/** Bir ayın KDV kırılımı (tutarlar string). Bilgi amaçlı — taşıma yapılmaz. */
export interface VatDeclarationMonth {
  month: string; // YYYY-MM
  outputVat: string; // Hesaplanan KDV (391)
  inputVat: string; // İndirilecek KDV (191)
  net: string; // outputVat - inputVat
}

export interface VatDeclarationReport {
  clinicId: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  outputVat: string; // dönem toplam Hesaplanan KDV (391)
  inputVat: string; // dönem toplam İndirilecek KDV (191)
  netVat: string; // outputVat - inputVat
  payableVat: string; // net > 0 → ödenecek KDV (360), aksi 0
  carryForwardVat: string; // net < 0 → devreden KDV (190), aksi 0
  months: VatDeclarationMonth[]; // kronolojik (artan ay)
}

export type GetVatDeclarationResponse = QueryResponse<VatDeclarationReport>;
