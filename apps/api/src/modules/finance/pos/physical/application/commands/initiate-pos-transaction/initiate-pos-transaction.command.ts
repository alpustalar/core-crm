import { IGetContext } from '@common/decorators/get-context.decorator';
import { CurrencyType } from '@input-type-schemas/CurrencySchema';

export interface InitiatePosTransactionInput {
  posDeviceId: string;
  clinicId: string;
  patientId?: string;
  appointmentId?: string;
  paymentId?: string;
  amount: number;
  currency: CurrencyType;
}

export class InitiatePosTransactionCommand {
  constructor(
    public readonly input: InitiatePosTransactionInput,
    public readonly ctx: IGetContext
  ) {}
}
