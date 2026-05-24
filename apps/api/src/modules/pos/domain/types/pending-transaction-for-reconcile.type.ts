import type { Decimal } from '@prisma/client/runtime/library';

export interface PendingTransactionDeviceSnapshot {
  host: string;
  port: number;
  terminalId: string;
  merchantId: string;
}

export interface PendingTransactionForReconcile {
  id: string;
  posDeviceId: string;
  clinicId: string;
  amount: Decimal;
  currency: string;
  initiatedAt: Date;
  device: PendingTransactionDeviceSnapshot;
}
