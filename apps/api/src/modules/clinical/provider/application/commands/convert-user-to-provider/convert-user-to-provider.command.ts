import { ConvertUserToProvider } from '@shared';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ConvertUserToProviderCommand {
  constructor(
    public readonly ctx: IGetContext,
    public readonly data: ConvertUserToProvider
  ) {}
}
