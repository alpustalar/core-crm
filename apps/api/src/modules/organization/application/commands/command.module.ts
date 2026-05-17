import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateOrganizationHandler } from './create-organization/create-organization.handler';
import { ORGANIZATION_REPO_TOKEN } from '@modules/organization/domain/repositories/organization.repository.interface';
import { OrganizationRepository } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization.repository';

const CommandHandlers = [CreateOrganizationHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    {
      provide: ORGANIZATION_REPO_TOKEN,
      useClass: OrganizationRepository,
    },
  ],
  exports: [...CommandHandlers],
})
export class OrganizationCommandModule {}
