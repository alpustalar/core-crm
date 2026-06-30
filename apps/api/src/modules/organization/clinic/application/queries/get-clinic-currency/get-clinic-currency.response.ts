import { QueryResponse } from '@shared/common/response/response.interface';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

/** Kliniğin fonksiyonel (defter) para birimini döner — muhasebe raporları bu birimdedir. */
export type GetClinicCurrencyResponse = QueryResponse<CurrencyType>;
