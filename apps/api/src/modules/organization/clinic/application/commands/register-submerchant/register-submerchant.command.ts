import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { RegisterClinicSubMerchantDto } from '@shared/modules/clinic/dto/index';

export class RegisterClinicSubMerchantCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly dto: RegisterClinicSubMerchantDto,
    public readonly ctx: IGetContext
  ) {}
}
