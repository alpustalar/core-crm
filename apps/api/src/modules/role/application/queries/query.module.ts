import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GetRoleBySlugHandler } from './get-role-by-slug/get-role-by-slug.handler';
import { ROLE_REPO_TOKEN } from '@modules/role/domain/repositories/role.repository.interface';
import { RoleRepository } from '@modules/role/infrastructure/persistence/prisma/repositories/role.repository';

const QueryHandlers = [GetRoleBySlugHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    ...QueryHandlers,
    { provide: ROLE_REPO_TOKEN, useClass: RoleRepository },
  ],
  exports: [...QueryHandlers],
})
export class RoleQueryModule {}
