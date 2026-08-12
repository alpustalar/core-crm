import { Module } from '@nestjs/common';
import { ROLE_QUERY_REPOSITORY } from '@modules/identity/role/domain/repositories/role/role.query.repository';
import { RoleQueryRepository } from '@modules/identity/role/infrastructure/persistence/prisma/repositories/role/role.query.repository';

@Module({
  providers: [
    { provide: ROLE_QUERY_REPOSITORY, useClass: RoleQueryRepository },
  ],
  exports: [ROLE_QUERY_REPOSITORY],
})
export class RepositoriesModule {}