import { Module } from '@nestjs/common';
import { GetInstallmentInfoHandler } from '@modules/payment/application/queries/iyzico/get-installment-info/get-installment-info.handler';
import { IYZICO_PROVIDER } from '@src/infrastructure/payment/providers/iyzico/domain/interfaces/iyzico.provider.interface';
import { IyzicoProvider } from '@src/infrastructure/payment/providers/iyzico/iyzico.provider';
import { IyzicoClient } from '@src/infrastructure/payment/providers/iyzico';

const QueryHandlers = [GetInstallmentInfoHandler];

@Module({
  providers: [
    ...QueryHandlers,
    {
      provide: IYZICO_PROVIDER,
      useClass: IyzicoProvider,
    },
    IyzicoClient,
  ],
  exports: [...QueryHandlers],
})
export class PaymentQueryModule {}
