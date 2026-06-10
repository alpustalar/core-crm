import { Module } from '@nestjs/common';
import { PosTransactionListener } from './listeners/pos-transaction.listener';

@Module({
  providers: [PosTransactionListener],
})
export class PosTransactionEventModule {}
