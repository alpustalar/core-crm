import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import type { SignConsentForm } from '@shared/modules/consent-form/types/commands';

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
