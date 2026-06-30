import { QueryResponse } from '@shared/common/response/response.interface';
import { OpenSlot } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export type GetProviderOpenSlotsResponse = QueryResponse<OpenSlot[]>;
