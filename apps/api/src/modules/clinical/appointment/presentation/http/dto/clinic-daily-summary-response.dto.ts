import { Expose } from 'class-transformer';

/**
 * Klinik günlük özeti (ClinicDailySummary read-model). Yalnız toplam sayaçlar —
 * hasta kimliği taşımaz; erişim handler'daki klinik policy kontrolüyle sınırlanır.
 */
export class ClinicDailySummaryResponseDto {
  @Expose() date: string;
  @Expose() total: number;
  @Expose() pending: number;
  @Expose() confirmed: number;
  @Expose() cancelled: number;
  @Expose() completed: number;
  @Expose() noShow: number;
}
