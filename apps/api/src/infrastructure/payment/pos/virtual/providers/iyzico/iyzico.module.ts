import { Module } from '@nestjs/common';
import { IyzicoClient } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/iyzico.client';
import { IyzicoProvider } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/iyzico.provider';
import { IYZICO_PROVIDER } from '@src/infrastructure/payment/pos/virtual/providers/iyzico/interfaces/iyzico.provider.interface';

@Module({
  providers: [
    IyzicoClient,
    { provide: IYZICO_PROVIDER, useClass: IyzicoProvider },
  ],
  exports: [IYZICO_PROVIDER],
})
export class IyzicoModule {}
