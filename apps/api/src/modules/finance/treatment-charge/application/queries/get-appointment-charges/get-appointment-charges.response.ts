import { QueryResponse } from '@shared/common/response/response.interface';
import { TreatmentCharge } from '@shared';
import { AppointmentChargeSummary } from '@modules/finance/treatment-charge/domain/contracts/treatment-charge.contracts';

/**
 * Satırlar ve özet birlikte döner: ekranda ikisi bir bütün olarak gösterilir,
 * ayrı çağrı yapmak iki isteğin arasında tutarsızlık penceresi açardı.
 */
export type GetAppointmentChargesResponse = QueryResponse<{
  items: TreatmentCharge[];
  summary: AppointmentChargeSummary | null;
}>;
