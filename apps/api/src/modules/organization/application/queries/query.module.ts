import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FindHandler } from './find/find.handler';
import { OrganizationRepositoryModule } from '@modules/organization/infrastructure/persistence/prisma/repositories/organization/organization.repository.module';

const QueryHandlers = [FindHandler];

@Module({
  imports: [CqrsModule, OrganizationRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class OrganizationQueryModule {}
