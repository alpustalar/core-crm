import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY,
  IClinicPaymentGatewayQueryRepository,
} from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway.repository';
import { GetClinicPaymentGatewayQuery } from './get-clinic-payment-gateway.query';
import { GetClinicPaymentGatewayResponse } from './get-clinic-payment-gateway.response';

@QueryHandler(GetClinicPaymentGatewayQuery)
export class GetClinicPaymentGatewayHandler implements IQueryHandler<
  GetClinicPaymentGatewayQuery,
  GetClinicPaymentGatewayResponse
> {
  constructor(
    @Inject(CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY)
    private readonly gatewayQueryRepo: IClinicPaymentGatewayQueryRepository
  ) {}

  async execute(
    query: GetClinicPaymentGatewayQuery
  ): Promise<GetClinicPaymentGatewayResponse> {
    const gateway = await this.gatewayQueryRepo.findByClinicId(query.clinicId);
    if (!gateway) return { data: null };

    return {
      data: {
        clinicId: gateway.clinicId,
        iyzicoSubMerchantKey: gateway.iyzicoSubMerchantKey,
        createdAt: gateway.createdAt,
        updatedAt: gateway.updatedAt,
      },
    };
  }
}
