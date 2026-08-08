import { Module } from '@nestjs/common';
import { OrganizationCommandRepository } from './organization.command.repository';
import { OrganizationQueryRepository } from './organization.query.repository';
import { ORGANIZATION_QUERY_REPOSITORY } from '@modules/organization/organization/domain/repositories/organization/organization.query.repository';
import { ORGANIZATION_COMMAND_REPOSITORY } from '@modules/organization/organization/domain/repositories/organization/organization.command.repository';

@Module({
  providers: [
    {
      provide: ORGANIZATION_COMMAND_REPOSITORY,
      useClass: OrganizationCommandRepository,
    },
    {
      provide: ORGANIZATION_QUERY_REPOSITORY,
      useClass: OrganizationQueryRepository,
    },
  ],
  exports: [ORGANIZATION_COMMAND_REPOSITORY, ORGANIZATION_QUERY_REPOSITORY],
})
export class OrganizationRepositoryModule {}
