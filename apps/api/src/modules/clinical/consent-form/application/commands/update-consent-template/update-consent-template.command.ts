import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { UpdateConsentTemplate } from '@shared/modules/consent-form/schemas/commands/update-consent-template.schema';

export class UpdateConsentTemplateCommand implements ICommand {
  constructor(
    public readonly payload: {
      readonly templateId: string;
      readonly data: UpdateConsentTemplate;
      readonly ctx: IGetContext;
    }
  ) {}
}
