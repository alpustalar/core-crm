import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export class ReleaseProjectResourceCommand implements ICommand {
  constructor(
    public readonly allocationId: string,
    public readonly ctx: IGetContext
  ) {}
}
