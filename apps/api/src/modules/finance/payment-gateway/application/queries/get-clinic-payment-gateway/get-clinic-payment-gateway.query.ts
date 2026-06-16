import { IQuery } from '@nestjs/cqrs';
import { IGetContext } from '@common/decorators';
import { GetClinicPaymentGatewayResponse } from './get-clinic-payment-gateway.response';

/** Bir kliniğin ödeme altyapısı (gateway) kaydını döner; yoksa null. */
export class GetClinicPaymentGatewayQuery implements IQuery {
  readonly __responseType!: GetClinicPaymentGatewayResponse;
  constructor(
    public readonly clinicId: string,
    public readonly ctx: IGetContext
  ) {}
}
