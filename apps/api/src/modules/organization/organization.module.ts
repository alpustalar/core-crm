import { Module } from '@nestjs/common';
import { OrganizationUseCasesModule } from '@modules/organization/application/use-cases/use-cases.module';
import { PolicyFactory } from '@modules/policy/application/policy-factory';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { UserModule } from '@modules/user/user.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { OrganizationsSoftDeletedListener } from '@modules/organization/infrastructure/events/listeners/organizations-soft-deleted.listener';
import { OrganizationProcessor } from '@modules/organization/infrastructure/queue/processors/organization.processor';
import { OrganizationProducer } from '@modules/organization/infrastructure/queue/producers/organization.producer';
import { OrganizationPresentationModule } from '@modules/organization/presentation/organization-presentation.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.ORGANIZATION,
    }),
    OrganizationUseCasesModule,
    ClinicModule,
    UserModule,
    AppointmentModule,
    OrganizationPresentationModule,
  ],
  providers: [
    PolicyFactory,
    OrganizationProcessor,
    OrganizationProducer,
    OrganizationsSoftDeletedListener,
  ],
})
export class OrganizationModule {}
