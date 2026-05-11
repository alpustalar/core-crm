import { ConvertUserToProviderDto } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ConvertUserToProviderCommand {
  constructor(
    public readonly context: IGetContext,
    public readonly dto: ConvertUserToProviderDto
  ) {}
}
