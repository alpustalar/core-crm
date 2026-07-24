import { QueryResponse } from '@shared/common/response/response.interface';
import { CashSession as ICashSession } from '@model-schema/CashSessionSchema';

export type GetOpenCashSessionResponse = QueryResponse<ICashSession | null>;
