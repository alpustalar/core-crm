import { Module } from '@nestjs/common';
import { FindHandler } from './find/find.handler';
import { OrganizationRepositoryModule } from '@modules/organization/organization/infrastructure/persistence/prisma/repositories/organization/organization.repository.module';

const QueryHandlers = [FindHandler];

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [...QueryHandlers],
  exports: [...QueryHandlers],
})
export class OrganizationQueryModule {}
