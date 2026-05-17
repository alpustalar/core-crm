import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PolicyModule } from '@modules/policy/policy.module';
import { PROVIDER_REPO_TOKEN } from '@modules/provider/domain/repositories/provider.repository.interface';
import { ProviderRepository } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider.repository';

// Command Handlers
import { ConvertUserToProviderHandler } from './convert-user-to-provider/convert-user-to-provider.handler';
import { CreateProviderAvailabilityHandler } from './create-provider-availability/create-provider-availability.handler';
import { UpdateProviderByStaffHandler } from './update-provider-by-staff/update-provider-by-staff.handler';
import { SoftDeleteProviderByClinicIdHandler } from './soft-delete-provider-by-clinic-id/soft-delete-provider-by-clinic-id.use-case';
import { PROVIDER_AVAILABILITY_REPO_TOKEN } from '@modules/provider/domain/repositories/provider-availability.repository.interface';
import { ProviderAvailabilityRepository } from '@modules/provider/infrastructure/persistence/prisma/repositories/provider-availability.repository';
import { ClinicModule } from '@modules/clinic/clinic.module';

const CommandHandlers = [
  ConvertUserToProviderHandler,
  CreateProviderAvailabilityHandler,
  UpdateProviderByStaffHandler,
  SoftDeleteProviderByClinicIdHandler,
];

@Module({
  imports: [CqrsModule, PolicyModule, ClinicModule],
  providers: [
    ...CommandHandlers,
    { provide: PROVIDER_REPO_TOKEN, useClass: ProviderRepository },
    {
      provide: PROVIDER_AVAILABILITY_REPO_TOKEN,
      useClass: ProviderAvailabilityRepository,
    },
  ],
  exports: [...CommandHandlers],
})
export class ProviderCommandsModule {}
