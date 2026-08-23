import { QueryResponse } from '@shared/common/response/response.interface';
import { Patient } from '@shared';

/** Liste düz model döner — entity değil (CLAUDE.md: query handler entity sızdırmaz). */
export type GetPatientsResponse = QueryResponse<Patient[]>;
