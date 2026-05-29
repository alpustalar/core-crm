import { QueryResponse } from '@shared/common/response/response.interface';

export interface PosDeviceItem {
  id: string;
  clinicId: string;
  label: string;
  terminalId: string;
  merchantId: string;
  isActive: boolean;
}

export type FindPosDevicesResponse = QueryResponse<PosDeviceItem[]>;
