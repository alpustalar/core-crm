import { Module } from '@nestjs/common';
import { PosDeviceRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-device/pos-device.repository.module';
import { PosTransactionRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/pos-transaction/pos-transaction.repository.module';
import { ClinicIyzicoTerminalConfigRepositoryModule } from '@modules/finance/pos/physical/infrastructure/persistence/prisma/repositories/clinic-iyzico-terminal-config/clinic-iyzico-terminal-config.repository.module';

@Module({
  imports: [
    PosDeviceRepositoryModule,
    PosTransactionRepositoryModule,
    ClinicIyzicoTerminalConfigRepositoryModule,
  ],
  exports: [
    PosDeviceRepositoryModule,
    PosTransactionRepositoryModule,
    ClinicIyzicoTerminalConfigRepositoryModule,
  ],
})
export class PhysicalPosRepositoriesModule {}
