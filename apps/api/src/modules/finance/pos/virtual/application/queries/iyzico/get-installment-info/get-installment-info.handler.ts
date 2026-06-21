import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetInstallmentInfoQuery } from './get-installment-info.query';
import { GetInstallmentInfoQueryResponse } from './get-installment-info.response';
import { randomUUID } from 'crypto';
import { IyzicoSdkStatus } from '@src/infrastructure/payment/pos/virtual/providers/iyzico';
import { BadRequestException, Inject } from '@nestjs/common';

import Iyzipay from 'iyzipay';
import {
  IIyzicoProvider,
  IYZICO_PROVIDER,
} from '@src/infrastructure/payment/pos/virtual/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { InstallmentOption } from '@modules/finance/payment/domain/payment.contracts';

@QueryHandler(GetInstallmentInfoQuery)
export class GetInstallmentInfoHandler
  implements
    IQueryHandler<GetInstallmentInfoQuery, GetInstallmentInfoQueryResponse>
{
  constructor(
    @Inject(IYZICO_PROVIDER)
    private readonly iyzicoProvider: IIyzicoProvider
  ) {}

  async execute(
    query: GetInstallmentInfoQuery
  ): Promise<GetInstallmentInfoQueryResponse> {
    const { dto } = query;
    const { binNumber, price } = dto;

    const sdkResult = await this.iyzicoProvider.getInstallmentInfo({
      locale: 'TR',
      conversationId: randomUUID(),
      price: price.toFixed(2),
      binNumber,
    });

    if (sdkResult.status.toLowerCase() !== IyzicoSdkStatus.SUCCESS) {
      throw new BadRequestException(
        `Taksit bilgisi alınamadı: ${sdkResult.errorMessage}`
      );
    }

    return {
      data: {
        options: (sdkResult.installmentDetails ?? []).map(
          (d: Iyzipay.InstallmentDetail): InstallmentOption => ({
            installmentNumber: d.installmentNumber,
            totalPrice: Number(d.totalPrice),
            installmentPrice: Number(d.installmentPrice),
            installmentRate: d.installmentRate,
          })
        ),
      },
    };
  }
}
