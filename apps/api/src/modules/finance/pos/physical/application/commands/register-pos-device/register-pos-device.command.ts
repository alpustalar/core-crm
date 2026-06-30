import { IGetContext } from '@common/decorators/get-context.decorator';
import type { PosProviderType } from '@input-type-schemas/PosProviderSchema';

export interface RegisterPosDeviceInput {
  clinicId: string;
  label: string;
  /** Varsayılan PAX; iyzico terminal cihazlar için IYZICO_TERMINAL gönderilir. */
  provider?: PosProviderType;

  // PAX (POSLINK / TCP) — provider = PAX için zorunlu
  terminalId?: string;
  merchantId?: string;
  host?: string;
  port?: number;

  // iyzico Terminal (Host API) — provider = IYZICO_TERMINAL için zorunlu
  deviceUniqueId?: string;
}

export class RegisterPosDeviceCommand {
  constructor(
    public readonly input: RegisterPosDeviceInput,
    public readonly ctx: IGetContext
  ) {}
}
