import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PolicyModule } from '@modules/policy/policy.module';
import { PROVIDER_REPO_TOKEN } from '@modules/provider/domain/repositories/provider.repository.interface';
import { POLICY_FACTORY_TOKEN } from '@modules/policy/domain/interfaces/policy-factory.interface';
import { ProviderRepository } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider.repository';
import { PolicyFactory } from '@modules/policy/application/policy-factory';

// Command Handlers
import { ConvertUserToProviderHandler } from './convert-user-to-provider/convert-user-to-provider.handler';
import { CreateProviderAvailabilityHandler } from './create-provider-availability/create-provider-availability.handler';
import { UpdateProviderByStaffHandler } from './update-provider-by-staff/update-provider-by-staff.handler';
import { SoftDeleteProviderByClinicIdHandler } from './soft-delete-provider-by-clinic-id/soft-delete-provider-by-clinic-id.use-case';

const CommandHandlers = [
  ConvertUserToProviderHandler,
  CreateProviderAvailabilityHandler,
  UpdateProviderByStaffHandler,
  SoftDeleteProviderByClinicIdHandler,
];

@Module({
  imports: [CqrsModule, PolicyModule],
  providers: [
    ...CommandHandlers,
    { provide: PROVIDER_REPO_TOKEN, useClass: ProviderRepository },
    { provide: POLICY_FACTORY_TOKEN, useClass: PolicyFactory },
  ],
  exports: [...CommandHandlers],
})
export class ProviderCommandsModule {}
