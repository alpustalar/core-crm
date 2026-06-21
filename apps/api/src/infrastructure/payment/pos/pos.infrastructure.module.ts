import { Module } from '@nestjs/common';
import { PosPhysicalInfrastructureModule } from '@src/infrastructure/payment/pos/physical/pos-physical.infrastructure.module';
import { PosVirtualInfrastructureModule } from '@src/infrastructure/payment/pos/virtual/pos-virtual.infrastructure.module';

@Module({
  imports: [PosPhysicalInfrastructureModule, PosVirtualInfrastructureModule],
  exports: [PosPhysicalInfrastructureModule, PosVirtualInfrastructureModule],
})
export class PosInfrastructureModule {}
