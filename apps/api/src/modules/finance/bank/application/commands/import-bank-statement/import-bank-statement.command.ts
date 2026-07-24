import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { ImportBankStatement } from '@shared/modules/bank/types/commands';

export class ImportBankStatementCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: ImportBankStatement,
    public readonly ctx: IGetContext
  ) {}
}
