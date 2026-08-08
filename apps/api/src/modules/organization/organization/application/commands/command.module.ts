import { UpdateOrganizationInfoHandler } from './update-organization-info/update-organization-info.handler';
import { SoftDeleteOrganizationHandler } from './soft-delete-organization/soft-delete-organization.handler';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateOrganizationHandler } from './create-organization/create-organization.handler';
import { OrganizationRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization/organization.repository.module';
import { OrganizationEventModule } from '@modules/organization/organization/infrastructure/messaging/events/organization-event.module';

const CommandHandlers = [
  UpdateOrganizationInfoHandler,
  SoftDeleteOrganizationHandler,
  CreateOrganizationHandler,
];

@Module({
  imports: [CqrsModule, OrganizationRepositoryModule, OrganizationEventModule],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers],
})
export class OrganizationCommandModule {}
