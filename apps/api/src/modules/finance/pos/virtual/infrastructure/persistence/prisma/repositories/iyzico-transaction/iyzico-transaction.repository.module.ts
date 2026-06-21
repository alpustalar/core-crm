import { Module } from '@nestjs/common';
import {
  IYZICO_TRANSACTION_COMMAND_REPOSITORY,
  IYZICO_TRANSACTION_QUERY_REPOSITORY,
} from '@modules/finance/pos/virtual/domain/repositories/iyzico-transaction.repository.interface';
import { IyzicoTransactionCommandRepository } from './iyzico-transaction.command.repository';
import { IyzicoTransactionQueryRepository } from './iyzico-transaction.query.repository';

@Module({
  providers: [
    {
      provide: IYZICO_TRANSACTION_COMMAND_REPOSITORY,
      useClass: IyzicoTransactionCommandRepository,
    },
    {
      provide: IYZICO_TRANSACTION_QUERY_REPOSITORY,
      useClass: IyzicoTransactionQueryRepository,
    },
  ],
  exports: [
    IYZICO_TRANSACTION_COMMAND_REPOSITORY,
    IYZICO_TRANSACTION_QUERY_REPOSITORY,
  ],
})
export class IyzicoTransactionRepositoryModule {}
