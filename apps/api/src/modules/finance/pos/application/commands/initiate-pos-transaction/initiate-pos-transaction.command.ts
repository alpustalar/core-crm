import { IGetContext } from '@common/decorators/get-context.decorator';

export interface InitiatePosTransactionInput {
  posDeviceId: string;
  clinicId: string;
  patientId?: string;
  appointmentId?: string;
  paymentId?: string;
  amount: number;
  currency?: string;
}

export class InitiatePosTransactionCommand {
  constructor(
    public readonly input: InitiatePosTransactionInput,
    public readonly ctx: IGetContext
  ) {}
}
