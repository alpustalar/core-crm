import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { CreateConsentTemplate } from '@shared/modules/consent-form/schemas/commands/create-consent-template.schema';

export class CreateConsentTemplateCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateConsentTemplate,
    public readonly ctx: IGetContext
  ) {}
}
