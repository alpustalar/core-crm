import { QueryResponse } from '@shared/common/response/response.interface';
import { OpenSlot } from '@modules/clinical/appointment/domain/contracts/appointment';

export type GetProviderOpenSlotsResponse = QueryResponse<OpenSlot[]>;
