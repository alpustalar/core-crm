import { QueryResponse } from '@shared/common/response/response.interface';
import { WaitingRoomEntry } from '@modules/clinical/appointment/domain/contracts/appointment.contracts';

export type GetWaitingRoomResponse = QueryResponse<WaitingRoomEntry[]>;
