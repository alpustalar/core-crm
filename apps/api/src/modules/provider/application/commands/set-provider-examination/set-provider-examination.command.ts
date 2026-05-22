import { IGetContext } from '@common/decorators/get-context.decorator';
import { SetProviderExaminationDto } from '@shared/modules/provider/dto/set-provider-examination.dto';

export class SetProviderExaminationCommand {
  constructor(
    public readonly providerId: string,
    public readonly dto: SetProviderExaminationDto,
    public readonly ctx: IGetContext
  ) {}
}
