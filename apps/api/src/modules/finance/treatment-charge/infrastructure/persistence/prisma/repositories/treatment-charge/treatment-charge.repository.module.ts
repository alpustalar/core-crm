import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { TreatmentChargeCommandRepository } from './treatment-charge.command.repository';
import { TreatmentChargeQueryRepository } from './treatment-charge.query.repository';
import { TREATMENT_CHARGE_COMMAND_REPOSITORY } from '@modules/finance/treatment-charge/domain/repositories/treatment-charge/treatment-charge.command.repository';
import { TREATMENT_CHARGE_QUERY_REPOSITORY } from '@modules/finance/treatment-charge/domain/repositories/treatment-charge/treatment-charge.query.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: TREATMENT_CHARGE_COMMAND_REPOSITORY,
      useClass: TreatmentChargeCommandRepository,
    },
    {
      provide: TREATMENT_CHARGE_QUERY_REPOSITORY,
      useClass: TreatmentChargeQueryRepository,
    },
  ],
  exports: [
    TREATMENT_CHARGE_COMMAND_REPOSITORY,
    TREATMENT_CHARGE_QUERY_REPOSITORY,
  ],
})
export class TreatmentChargeRepositoryModule {}
