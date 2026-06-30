import { Module } from '@nestjs/common';
import { ClinicExceptionQueryRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-exception/clinic-exception.query.repository';
import { CLINIC_EXCEPTION_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinix-exception.repository.interface';

@Module({
  providers: [
    {
      provide: CLINIC_EXCEPTION_QUERY_REPOSITORY,
      useClass: ClinicExceptionQueryRepository,
    },
  ],
  exports: [CLINIC_EXCEPTION_QUERY_REPOSITORY],
})
export class ClinicExceptionRepositoryModule {}
