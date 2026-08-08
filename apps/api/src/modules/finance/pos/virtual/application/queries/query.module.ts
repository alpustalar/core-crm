import { Module } from '@nestjs/common';
import { GetInstallmentInfoHandler } from '@modules/finance/pos/virtual/application/queries/iyzico/get-installment-info/get-installment-info.handler';
import { IYZICO_PROVIDER } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/interfaces/iyzico.provider.interface';
import { IyzicoProvider } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/iyzico.provider';
import { IyzicoClient } from '@src/infrastructure/payment/pos/virtual/providers/iyzico';

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
})
export class VirtualPosQueryModule {}
