import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { SignConsentForm } from '@shared/modules/consent-form/schemas/commands/sign-consent-form.schema';

export class SignConsentFormCommand implements ICommand {
  readonly __responseType!: string;
  constructor(
    public readonly payload: {
      readonly patientId: string;
      readonly data: SignConsentForm;
      readonly ctx: IGetContext;
    }
  ) {}
}
