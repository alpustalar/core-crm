import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { UpsertClinicGovernmentSpecsHandler } from './upsert-clinic-government-specs/upsert-clinic-government-specs.handler';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { ClinicGovernmentSpecsRepositoryModule } from '../../infrastructure/persistence/prisma/repositories/clinic-government-specs/clinic-government-specs.repository.module';

const CommandHandlers = [UpsertClinicGovernmentSpecsHandler];

@Module({
  imports: [CqrsModule, PolicyModule, ClinicGovernmentSpecsRepositoryModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ClinicGovernmentSpecsCommandModule {}
