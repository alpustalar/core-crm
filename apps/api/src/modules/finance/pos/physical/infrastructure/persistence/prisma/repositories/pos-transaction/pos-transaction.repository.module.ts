import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { POS_TRANSACTION_COMMAND_REPOSITORY } from '@modules/finance/pos/physical/domain/repositories/pos-transaction/pos-transaction.command.repository';
import { PosTransactionCommandRepository } from './pos-transaction.command.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: POS_TRANSACTION_COMMAND_REPOSITORY,
      useClass: PosTransactionCommandRepository,
    },
  ],
  exports: [POS_TRANSACTION_COMMAND_REPOSITORY],
})
export class PosTransactionRepositoryModule {}
