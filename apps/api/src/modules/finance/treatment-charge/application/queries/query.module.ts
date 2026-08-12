import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAppointmentChargesHandler } from './get-appointment-charges/get-appointment-charges.handler';
import { GetAppointmentChargeSummaryHandler } from './get-appointment-charge-summary/get-appointment-charge-summary.handler';
import { TreatmentChargeRepositoryModule } from '@modules/finance/treatment-charge/infrastructure/persistence/prisma/repositories/treatment-charge/treatment-charge.repository.module';
import { PolicyModule } from '@modules/platform/policy/policy.module';

export const TREATMENT_CHARGE_QUERY_HANDLERS = [
  GetAppointmentChargesHandler,
  GetAppointmentChargeSummaryHandler,
];

@Module({
  imports: [CqrsModule, TreatmentChargeRepositoryModule, PolicyModule],
  providers: TREATMENT_CHARGE_QUERY_HANDLERS,
  exports: TREATMENT_CHARGE_QUERY_HANDLERS,
})
export class TreatmentChargeQueryModule {}
