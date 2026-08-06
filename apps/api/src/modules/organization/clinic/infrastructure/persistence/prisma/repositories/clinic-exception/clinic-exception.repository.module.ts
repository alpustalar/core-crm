import { Module } from '@nestjs/common';
import { ClinicExceptionQueryRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-exception/clinic-exception.query.repository';
import { ClinicExceptionCommandRepository } from '@modules/organization/clinic/infrastructure/persistence/prisma/repositories/clinic-exception/clinic-exception.command.repository';
import { CLINIC_EXCEPTION_COMMAND_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-exception/clinic-exception.command.repository.interface';
import { CLINIC_EXCEPTION_QUERY_REPOSITORY } from '@modules/organization/clinic/domain/repositories/clinic-exception/clinic-exception.query.repository.interface';

@Module({
  providers: [
    {
      provide: CLINIC_EXCEPTION_QUERY_REPOSITORY,
      useClass: ClinicExceptionQueryRepository,
    },
    {
      provide: CLINIC_EXCEPTION_COMMAND_REPOSITORY,
      useClass: ClinicExceptionCommandRepository,
    },
  ],
  exports: [
    CLINIC_EXCEPTION_QUERY_REPOSITORY,
    CLINIC_EXCEPTION_COMMAND_REPOSITORY,
  ],
})
export class ClinicExceptionRepositoryModule {}
