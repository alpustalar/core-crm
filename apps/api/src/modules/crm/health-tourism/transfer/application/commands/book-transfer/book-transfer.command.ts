import { IGetContext } from '@common/decorators/get-context.decorator';
import { BookTransferResponse } from './book-transfer.response';
import { BookTransfer } from '@shared/modules/health-tourism';

export class BookTransferCommand {
  readonly __responseType!: BookTransferResponse;

  constructor(
    public readonly data: BookTransfer,
    public readonly ctx: IGetContext
  ) {}
}
