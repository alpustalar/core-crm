import { ICommand } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators/get-context.decorator';
import { RegisterClinicSubMerchantDto } from '@shared/modules/clinic/dto/index';

/**
 * Bir kliniğin Iyzico marketplace alt üye işyerini oluşturur/günceller ve
 * sonucu ClinicPaymentGateway satellite'ine yazar (finance bounded-context).
 */
export class RegisterClinicPaymentGatewayCommand implements ICommand {
  readonly __responseType!: void;
  constructor(
    public readonly clinicId: string,
    public readonly dto: RegisterClinicSubMerchantDto,
    public readonly ctx: IGetContext
  ) {}
}
