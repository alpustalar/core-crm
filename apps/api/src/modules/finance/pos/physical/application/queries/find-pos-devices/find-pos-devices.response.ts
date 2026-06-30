import { QueryResponse } from '@shared/common/response/response.interface';
import type { PosProviderType } from '@input-type-schemas/PosProviderSchema';

export interface PosDeviceItem {
  id: string;
  clinicId: string;
  label: string;
  provider: PosProviderType;
  terminalId: string | null;
  merchantId: string | null;
  deviceUniqueId: string | null;
  isActive: boolean;
}

export type FindPosDevicesResponse = QueryResponse<PosDeviceItem[]>;
