import { Module } from '@nestjs/common';
import { IYZICO_TRANSACTION_COMMAND_REPOSITORY } from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransactionCommandRepository } from './iyzico-transaction.command.repository';

@Module({
  providers: [
    {
      provide: IYZICO_TRANSACTION_COMMAND_REPOSITORY,
      useClass: IyzicoTransactionCommandRepository,
    },
  ],
  exports: [IYZICO_TRANSACTION_COMMAND_REPOSITORY],
})
export class IyzicoTransactionRepositoryModule {}
