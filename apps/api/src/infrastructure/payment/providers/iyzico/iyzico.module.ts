import { Module } from '@nestjs/common';
import { IyzicoClient } from '@src/infrastructure/payment/providers/iyzico/iyzico.client';
import { IyzicoTransactionRepository } from '@src/infrastructure/payment/providers/iyzico/repositories/iyzico-transaction.repository';
import { IyzicoProvider } from '@src/infrastructure/payment/providers/iyzico/iyzico.provider';
import { IYZICO_TRANSACTION_REPOSITORY } from './domain/interfaces/iyzico-transaction.repository.interface';
import { IYZICO_PROVIDER } from './domain/interfaces/iyzico.provider.interface';

@Module({
  providers: [
    IyzicoClient,
    {
      provide: IYZICO_TRANSACTION_REPOSITORY,
      useClass: IyzicoTransactionRepository,
    },
    { provide: IYZICO_PROVIDER, useClass: IyzicoProvider },
  ],
  exports: [IYZICO_PROVIDER, IYZICO_TRANSACTION_REPOSITORY],
})
export class IyzicoModule {}
