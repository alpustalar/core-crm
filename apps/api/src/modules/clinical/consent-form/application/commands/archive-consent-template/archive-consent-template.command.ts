import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';

export class ArchiveConsentTemplateCommand implements ICommand {
  constructor(
    public readonly templateId: string,
    public readonly ctx: IGetContext
  ) {}
}
