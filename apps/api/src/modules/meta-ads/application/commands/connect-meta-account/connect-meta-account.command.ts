import { ICommand } from '@nestjs/cqrs';
import { ConnectMetaAccountDto } from '@shared/modules/meta-ads/dto/commands';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ConnectMetaAccountCommand implements ICommand {
  constructor(
    public readonly dto: ConnectMetaAccountDto,
    public readonly clinicId: string,
    public readonly ctx: IGetContext,
  ) {}
}
