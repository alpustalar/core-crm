import { GetRoleByIdHandler } from './get-role-by-id/get-role-by-id.handler';
import { Module } from '@nestjs/common';
import { GetRoleBySlugHandler } from './get-role-by-slug/get-role-by-slug.handler';
import { ROLE_REPO } from '@modules/role/domain/repositories/role.repository.interface';
import { RoleRepository } from '@modules/role/infrastructure/persistence/prisma/repositories/role.repository';

const QueryHandlers = [GetRoleByIdHandler, GetRoleBySlugHandler];

@Module({
  providers: [
    ...QueryHandlers,
    { provide: ROLE_REPO, useClass: RoleRepository },
  ],
  exports: [...QueryHandlers],
})
export class RoleQueryModule {}
