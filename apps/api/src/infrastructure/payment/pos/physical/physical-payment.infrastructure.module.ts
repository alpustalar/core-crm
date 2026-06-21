import { Module } from '@nestjs/common';
import { PHYSICAL_POS_PROVIDER } from '@modules/finance/pos/physical/domain/interfaces/physical-pos-provider.interface';
import { NullPhysicalPosProvider } from './providers/null-physical-pos.provider';

@Module({
  providers: [
    { provide: PHYSICAL_POS_PROVIDER, useClass: NullPhysicalPosProvider },
  ],
  exports: [PHYSICAL_POS_PROVIDER],
})
export class PhysicalPosProviderModule {}
