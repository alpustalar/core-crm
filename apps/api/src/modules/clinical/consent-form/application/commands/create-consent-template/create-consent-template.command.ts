import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { CreateConsentTemplate } from '@shared/modules/consent-form/types/commands';

export class CreateConsentTemplateCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly data: CreateConsentTemplate,
    public readonly ctx: IGetContext
  ) {}
}
