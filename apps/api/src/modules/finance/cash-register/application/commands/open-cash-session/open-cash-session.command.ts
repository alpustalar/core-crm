import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { OpenCashSession } from '@shared/modules/cash-register/types/commands';

export class OpenCashSessionCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: OpenCashSession,
    public readonly ctx: IGetContext
  ) {}
}
