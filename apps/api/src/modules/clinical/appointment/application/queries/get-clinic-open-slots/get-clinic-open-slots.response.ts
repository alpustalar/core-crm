import { QueryResponse } from '@shared/common/response/response.interface';
import { ClinicOpenSlotsDay } from '@modules/clinical/appointment/domain/contracts/appointment';

/**
 * Klinik geneli açık slotlar, güne göre gruplanmış olarak döner (yalnız en az bir
 * boşluğu olan günler). Read-model; entity DEĞİL.
 */
export type GetClinicOpenSlotsResponse = QueryResponse<ClinicOpenSlotsDay[]>;
