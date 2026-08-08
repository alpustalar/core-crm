import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetClinicPaymentGatewayQuery } from './get-clinic-payment-gateway.query';
import { GetClinicPaymentGatewayResponse } from './get-clinic-payment-gateway.response';
import {
  CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY,
  IClinicPaymentGatewayQueryRepository,
} from '@modules/finance/payment-gateway/domain/repositories/clinic-payment-gateway/clinic-payment-gateway.query.repository';

@QueryHandler(GetClinicPaymentGatewayQuery)
export class GetClinicPaymentGatewayHandler
  implements
    IQueryHandler<
      GetClinicPaymentGatewayQuery,
      GetClinicPaymentGatewayResponse
    >
{
  constructor(
    @Inject(CLINIC_PAYMENT_GATEWAY_QUERY_REPOSITORY)
    private readonly clinicPaymentGatewayRepo: IClinicPaymentGatewayQueryRepository
  ) {}

  async execute(
    query: GetClinicPaymentGatewayQuery
  ): Promise<GetClinicPaymentGatewayResponse> {
    const gateway = await this.clinicPaymentGatewayRepo.findByClinicId(
      query.clinicId
    );
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
