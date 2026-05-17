import { OrganizationCommandModule } from '@modules/organization/application/commands/command.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { OrganizationUseCasesModule } from '@modules/organization/application/use-cases/use-cases.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { UserModule } from '@modules/user/user.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { OrganizationsSoftDeletedListener } from '@modules/organization/infrastructure/events/listeners/organizations-soft-deleted.listener';
import { OrganizationProcessor } from '@modules/organization/infrastructure/queue/processors/organization.processor';
import { OrganizationProducer } from '@modules/organization/infrastructure/queue/producers/organization.producer';
import { OrganizationPresentationModule } from '@modules/organization/presentation/organization.presentation.module';
import { PolicyModule } from '@modules/policy/policy.module';
import { OrganizationModuleApi } from '@modules/organization/organization.module.api';
import { ORGANIZATION_MODULE_API_TOKEN } from '@modules/organization/domain/interfaces/organization.module.api.interface';

@Module({
  imports: [
    CqrsModule,
    OrganizationCommandModule,
    BullModule.registerQueue({
      name: QUEUES.ORGANIZATION,
    }),
    OrganizationUseCasesModule,
    ClinicModule,
    UserModule,
    AppointmentModule,
    OrganizationPresentationModule,
    PolicyModule,
  ],
  providers: [
    OrganizationProcessor,
    OrganizationProducer,
    OrganizationsSoftDeletedListener,
    { provide: ORGANIZATION_MODULE_API_TOKEN, useClass: OrganizationModuleApi },
  ],
  exports: [ORGANIZATION_MODULE_API_TOKEN],
})
export class OrganizationModule {}
