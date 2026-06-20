import { ICommand } from '@nestjs/cqrs';
import { CreatePaymentDto } from '@shared/modules/payment/dto';

export type CreatePaymentCommandResponse = string;
type InternalRelations = { paymentId: string; installmentId?: string };

export class CreatePaymentCommand implements ICommand {
  readonly __responseType!: CreatePaymentCommandResponse;

  constructor(
    public readonly dto: CreatePaymentDto,
    public readonly internalRelations?: InternalRelations
  ) {}
}
