import { Module } from '@nestjs/common';
import { PosDeviceRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-device/pos-device.repository.module';
import { PosTransactionRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-transaction/pos-transaction.repository.module';

@Module({
  providers: [PosDeviceRepositoryModule, PosTransactionRepositoryModule],
  exports: [PosDeviceRepositoryModule, PosTransactionRepositoryModule],
})
export class PhysicalRepositoryModule {}
