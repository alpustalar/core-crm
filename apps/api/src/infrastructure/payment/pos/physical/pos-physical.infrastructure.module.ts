import { Module } from '@nestjs/common';
import { PHYSICAL_POS_PROVIDER } from '@modules/finance/pos/physical/domain/interfaces/physical-pos-provider.interface';
import { NullPhysicalPosProvider } from './providers/null-physical-pos.provider';
import { IyzicoTerminalModule } from '@src/infrastructure/payment/pos/physical/providers/iyzico-terminal/iyzico-terminal.module';
import { PaxModule } from '@src/infrastructure/payment/pos/physical/providers/pax/pax.module';

@Module({
  imports: [IyzicoTerminalModule, PaxModule],
  providers: [
    { provide: PHYSICAL_POS_PROVIDER, useClass: NullPhysicalPosProvider },
  ],
  exports: [PHYSICAL_POS_PROVIDER, IyzicoTerminalModule, PaxModule],
})
export class PosPhysicalInfrastructureModule {}
