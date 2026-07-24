import { GetRoleByIdHandler } from './get-role-by-id/get-role-by-id.handler';
import { Module } from '@nestjs/common';
import { GetRoleBySlugHandler } from './get-role-by-slug/get-role-by-slug.handler';
import { ROLE_QUERY_REPOSITORY } from '@modules/identity/role/domain/repositories/role.repository.interface';
import { RoleQueryRepository } from '@modules/identity/role/infrastructure/persistence/prisma/repositories/role.repository';

const QueryHandlers = [GetRoleByIdHandler, GetRoleBySlugHandler];

@Module({
  providers: [
    ...QueryHandlers,
    { provide: ROLE_QUERY_REPOSITORY, useClass: RoleQueryRepository },
  ],
  exports: [...QueryHandlers],
})
export class RoleQueryModule {}
