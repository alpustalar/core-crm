import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionManager } from '@src/infrastructure/persistence/prisma/transaction/transaction.manager';
import { OutboxRepository } from '@src/infrastructure/persistence/prisma/outbox/outbox.repository';

@Global()
@Module({
  providers: [PrismaService, TransactionManager, OutboxRepository],
  exports: [PrismaService, TransactionManager],
})
export class PrismaModule {}
