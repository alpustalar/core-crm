import { ExceptionTypeType as ExceptionType } from '@input-type-schemas/ExceptionTypeSchema';

export interface CreateProviderExceptionProps {
  id?: string;
  type: ExceptionType;
  startTime: Date;
  endTime: Date;
  reason?: string | null;
  providerId: string;
}
