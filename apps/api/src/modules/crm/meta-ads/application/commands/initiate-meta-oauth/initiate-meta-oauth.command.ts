import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';

export class InitiateMetaOAuthCommand implements ICommand {
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
