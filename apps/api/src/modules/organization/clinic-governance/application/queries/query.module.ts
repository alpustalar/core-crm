import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetClinicGovernmentSpecsHandler } from './get-clinic-government-specs/get-clinic-government-specs.handler';
import { ClinicGovernmentSpecsRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/clinic-government-specs/clinic-government-specs.repository.module';

const QueryHandlers = [GetClinicGovernmentSpecsHandler];

@Module({
  imports: [CqrsModule, ClinicGovernmentSpecsRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class ClinicGovernmentSpecsQueryModule {}
