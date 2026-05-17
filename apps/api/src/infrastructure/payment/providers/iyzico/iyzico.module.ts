import { Module } from '@nestjs/common';
import { IyzicoClient } from '@src/infrastructure/persistence/payment/providers/iyzico/iyzico.client';
import { IyzicoTransactionRepository } from '@src/infrastructure/persistence/payment/providers/iyzico/repositories/iyzico-transaction.repository';
import { IyzicoProvider } from '@src/infrastructure/persistence/payment/providers/iyzico/iyzico.provider';

@Module({
  providers: [IyzicoClient, IyzicoTransactionRepository, IyzicoProvider],
  exports: [IyzicoProvider, IyzicoTransactionRepository],
})
export class IyzicoModule {}
