export interface PosDeviceItem {
  id: string;
  clinicId: string;
  label: string;
  terminalId: string;
  merchantId: string;
  isActive: boolean;
}

export type FindPosDevicesResponse = PosDeviceItem[];
