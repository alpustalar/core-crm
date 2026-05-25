import { OrganizationQueryModule } from '@modules/organization/application/queries/query.module';
import { OrganizationCommandModule } from '@modules/organization/application/commands/command.module';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '@common/constants';
import { ClinicModule } from '@modules/clinic/clinic.module';
import { UserModule } from '@modules/user/user.module';
import { AppointmentModule } from '@modules/appointment/appointment.module';
import { OrganizationProcessor } from '@modules/organization/infrastructure/queue/processors/organization.processor';
import { OrganizationProducer } from '@modules/organization/infrastructure/queue/producers/organization.producer';
import { OrganizationPresentationModule } from '@modules/organization/presentation/organization.presentation.module';
import { PolicyModule } from '@modules/policy/policy.module';
import { OrganizationEventModule } from '@modules/organization/infrastructure/events/organization-event.module';

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
