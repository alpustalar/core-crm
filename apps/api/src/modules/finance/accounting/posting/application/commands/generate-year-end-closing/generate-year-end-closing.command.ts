import { IGetContext } from '@common/decorators';

export interface GenerateYearEndClosingInput {
  clinicId: string;
  organizationId: string;
  periodId: string;
  dateFrom: Date; // dönem başı (sonuç hesabı bakiyeleri bu aralıktan)
  dateTo: Date; // dönem sonu
  entryDate: Date; // kapanış fişlerinin tarihi (genelde dönem sonu)
  performedById?: string | null;
}

/**
 * Yıl sonu kapanış fişlerini üretir (doc 04 K/Z devri): tüm 6xx/7xx sonuç hesapları
 * (69x özet hariç) → 690 Dönem Kârı/Zararı'na kapatılır, ardından 690 → 590 (net kâr)
 * veya 591 (net zarar)'a devredilir. Sonuç hesaplarında hareket yoksa fiş üretilmez.
 * ClosePeriod tarafından dönem CLOSED'a alınmadan önce çağrılır.
 */
export class GenerateYearEndClosingCommand {
  readonly __responseType!: void;
  constructor(
    public readonly input: GenerateYearEndClosingInput,
    public readonly ctx: IGetContext
  ) {}
}
