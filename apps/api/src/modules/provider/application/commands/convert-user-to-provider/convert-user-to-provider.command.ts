import { ConvertUserToProviderDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ConvertUserToProviderCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly dto: ConvertUserToProviderDto
  ) {}
}
