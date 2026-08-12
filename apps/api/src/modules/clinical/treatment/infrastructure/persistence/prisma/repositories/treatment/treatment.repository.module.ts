import { Module } from '@nestjs/common';
import { PrismaModule } from '@src/infrastructure/persistence/prisma/prisma.module';
import { TreatmentQueryRepository } from './treatment.query.repository';
import { TREATMENT_QUERY_REPOSITORY } from '@modules/clinical/treatment/domain/repositories/treatment/treatment.query.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: TREATMENT_QUERY_REPOSITORY, useClass: TreatmentQueryRepository },
  ],
  exports: [TREATMENT_QUERY_REPOSITORY],
})
export class TreatmentRepositoryModule {}
