import { IGetContext } from '@common/decorators/get-context.decorator';

export interface RegisterPosDeviceInput {
  clinicId: string;
  label: string;
  terminalId: string;
  merchantId: string;
  host: string;
  port: number;
}

export class RegisterPosDeviceCommand {
  constructor(
    public readonly input: RegisterPosDeviceInput,
    public readonly ctx: IGetContext
  ) {}
}
