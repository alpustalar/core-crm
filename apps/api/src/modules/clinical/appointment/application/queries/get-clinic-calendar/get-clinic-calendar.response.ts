import { QueryResponse } from '@shared/common/response/response.interface';
import { ClinicCalendarDay } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

/**
 * Klinik tam takvimi, güne göre gruplanmış (klinik yereli). Sayfasız; aralıktaki
 * tüm randevular. Read-model; entity DEĞİL.
 */
export type GetClinicCalendarResponse = QueryResponse<ClinicCalendarDay[]>;
