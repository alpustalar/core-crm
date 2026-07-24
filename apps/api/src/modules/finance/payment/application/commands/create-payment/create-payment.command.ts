import { ICommand } from '@nestjs/cqrs';
import { CreatePayment } from '@shared';

export type CreatePaymentCommandResponse = string;

type CreatePaymentInternalRelations = {
  paymentId: string;
  installmentId?: string;
};

export class CreatePaymentCommand implements ICommand {
  readonly __responseType!: CreatePaymentCommandResponse;

  constructor(
    public readonly data: CreatePayment,
    public readonly internalRelations?: CreatePaymentInternalRelations
  ) {}
}
