import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AddTreatmentChargeHandler } from './add-treatment-charge/add-treatment-charge.handler';
import { UpdateChargeDiscountHandler } from './update-charge-discount/update-charge-discount.handler';
import { VoidTreatmentChargeHandler } from './void-treatment-charge/void-treatment-charge.handler';
import { TreatmentChargeRepositoryModule } from '@modules/finance/treatment-charge/infrastructure/persistence/prisma/repositories/treatment-charge/treatment-charge.repository.module';
import { PolicyModule } from '@modules/platform/policy/policy.module';

export const TREATMENT_CHARGE_COMMAND_HANDLERS = [
  AddTreatmentChargeHandler,
  UpdateChargeDiscountHandler,
  VoidTreatmentChargeHandler,
];

@Module({
  imports: [
    CqrsModule,
    TreatmentChargeRepositoryModule,
    PolicyModule,
  ],
  providers: TREATMENT_CHARGE_COMMAND_HANDLERS,
  exports: TREATMENT_CHARGE_COMMAND_HANDLERS,
})
export class TreatmentChargeCommandModule {}
