import { OperationMode } from '@prisma/client';

export interface CreateProviderProps {
  id: string;
  userId: string;
  clinicId: string;
  providerTitleId?: string | null;
  providerSpecialtyId?: string | null;
  publicPhone?: string | null;
  publicEmail?: string | null;
  isActive?: boolean;
  operationMode?: OperationMode;
  sectorId?: string | null;
}
