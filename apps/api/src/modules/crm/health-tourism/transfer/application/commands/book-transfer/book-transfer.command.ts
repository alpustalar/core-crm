import { BookTransferDto } from '@shared/modules/health-tourism/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { BookTransferResponse } from './book-transfer.response';

export class BookTransferCommand {
  readonly __responseType!: BookTransferResponse;

  constructor(
    public readonly dto: BookTransferDto,
    public readonly ctx: IGetContext,
  ) {}
}
