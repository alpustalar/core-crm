import { Module } from '@nestjs/common';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { ClinicModule } from '@modules/organization/clinic/clinic.module';
import { ProviderRepositoryModule } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider/provider.repository.module';
import { ProviderAvailabilityRepository } from '@modules/clinical/provider/infrastructure/persistence/prisma/repositories/provider-availability.repository';
import { PROVIDER_AVAILABILITY_REPOSITORY } from '@modules/clinical/provider/domain/repositories/provider-availability.repository.interface';

import { ConvertUserToProviderHandler } from './convert-user-to-provider/convert-user-to-provider.handler';
import { CreateProviderAvailabilityHandler } from './create-provider-availability/create-provider-availability.handler';
import { SoftDeleteProviderByClinicIdHandler } from './soft-delete-provider-by-clinic-id/soft-delete-provider-by-clinic-id.use-case';
import { UpdateProviderInfoHandler } from './update-provider-info/update-provider-info.handler';
import { SetProviderActiveHandler } from './set-provider-active/set-provider-active.handler';
import { SetProviderOperationModeHandler } from './set-provider-operation-mode/set-provider-operation-mode.handler';
import { SetProviderExaminationHandler } from './set-provider-examination/set-provider-examination.handler';
import { CreateProviderShiftHandler } from './create-provider-shift/create-provider-shift.handler';

const CommandHandlers = [
  ConvertUserToProviderHandler,
  CreateProviderAvailabilityHandler,
  CreateProviderShiftHandler,
  SoftDeleteProviderByClinicIdHandler,
  UpdateProviderInfoHandler,
  SetProviderActiveHandler,
  SetProviderOperationModeHandler,
  SetProviderExaminationHandler,
];

@Module({
  imports: [PolicyModule, ClinicModule, ProviderRepositoryModule],
  providers: [
    ...CommandHandlers,
    {
      provide: PROVIDER_AVAILABILITY_REPOSITORY,
      useClass: ProviderAvailabilityRepository,
    },
  ],
  exports: [...CommandHandlers],
})
export class ProviderCommandsModule {}
