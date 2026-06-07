import { BookTransferDto } from '@shared/modules/health-tourism/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class BookTransferCommand {
  constructor(
    public readonly dto: BookTransferDto,
    public readonly ctx: IGetContext,
  ) {}
}
