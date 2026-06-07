import { OrganizationQueryModule } from '@modules/organization/organization/application/queries/query.module';
import { OrganizationCommandModule } from '@modules/organization/organization/application/commands/command.module';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { ClinicModule } from '@modules/organization/clinic/clinic.module';
import { UserModule } from '@modules/identity/user/user.module';
import { AppointmentModule } from '@modules/clinical/appointment/appointment.module';
import { OrganizationProcessor } from '@modules/organization/organization/infrastructure/queue/processors/organization.processor';
import { OrganizationProducer } from '@modules/organization/organization/infrastructure/queue/producers/organization.producer';
import { OrganizationPresentationModule } from '@modules/organization/organization/presentation/organization.presentation.module';
import { PolicyModule } from '@modules/platform/policy/policy.module';
import { OrganizationEventModule } from '@modules/organization/organization/infrastructure/events/organization-event.module';

@Module({
  imports: [
    OrganizationQueryModule,
    OrganizationCommandModule,
    OrganizationEventModule,
    BullModule.registerQueue({
      name: QUEUES.ORGANIZATION,
    }),
    ClinicModule,
    UserModule,
    AppointmentModule,
    OrganizationPresentationModule,
    PolicyModule,
  ],
  providers: [OrganizationProcessor, OrganizationProducer],
})
export class OrganizationModule {}
