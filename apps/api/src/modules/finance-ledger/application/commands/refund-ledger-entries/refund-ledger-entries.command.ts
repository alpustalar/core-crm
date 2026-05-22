import { IGetContext } from '@common/decorators';

export class RefundLedgerEntriesCommand {
  constructor(
    public readonly paymentId: string,
    public readonly ctx: IGetContext
  ) {}
}
