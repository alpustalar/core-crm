import { Module } from '@nestjs/common';
import { ClinicDomainServicesModule } from '@modules/organization/clinic/domain/services/services.module';

import { ConvertUserToProviderHandler } from './convert-user-to-provider/convert-user-to-provider.handler';
import { CreateProviderAvailabilityHandler } from './create-provider-availability/create-provider-availability.handler';
import { SoftDeleteProviderByClinicIdHandler } from './soft-delete-provider-by-clinic-id/soft-delete-provider-by-clinic-id.handler';
import { UpdateProviderInfoHandler } from './update-provider-info/update-provider-info.handler';
import { SetProviderActiveHandler } from './set-provider-active/set-provider-active.handler';
import { SetProviderOperationModeHandler } from './set-provider-operation-mode/set-provider-operation-mode.handler';
import { SetProviderExaminationHandler } from './set-provider-examination/set-provider-examination.handler';
import { CreateProviderShiftHandler } from './create-provider-shift/create-provider-shift.handler';
import { ProviderInfrastructureModule } from '@modules/clinical/provider/infrastructure/infrastructure.module';

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
  imports: [ClinicDomainServicesModule, ProviderInfrastructureModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class ProviderCommandsModule {}
