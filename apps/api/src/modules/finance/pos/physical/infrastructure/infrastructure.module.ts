import { Module } from '@nestjs/common';
import { PosTransactionEventModule } from '@modules/finance/pos/physical/infrastructure/messaging/events/pos-transaction-event.module';
import { PosQueueModule } from '@modules/finance/pos/physical/infrastructure/messaging/queue/pos-queue.module';
import { PhysicalPosRepositoriesModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/repositories.module';

const PhysicalPosInfrastructureModules = [
  PosTransactionEventModule,
  PosQueueModule,
  PhysicalPosRepositoriesModule,
];

@Module({
  imports: [...PhysicalPosInfrastructureModules],
  exports: [...PhysicalPosInfrastructureModules],
})
export class PhysicalPosInfrastructureModule {}
