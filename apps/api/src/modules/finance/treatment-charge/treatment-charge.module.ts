import { Module } from '@nestjs/common';
import { TreatmentChargeCommandModule } from './application/commands/command.module';
import { TreatmentChargeQueryModule } from './application/queries/query.module';
import { TreatmentChargePresentationModule } from './presentation/treatment-charge-presentation.module';

@Module({
  imports: [
    TreatmentChargeCommandModule,
    TreatmentChargeQueryModule,
    TreatmentChargePresentationModule,
  ],
  exports: [TreatmentChargeCommandModule, TreatmentChargeQueryModule],
})
export class TreatmentChargeModule {}
