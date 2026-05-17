import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RoleQueryModule } from '@modules/role/application/queries/query.module';
import { ROLE_MODULE_API_TOKEN } from '@modules/role/domain/interfaces/role.module.api.interface';
import { RoleModuleApi } from '@modules/role/role.module.api';

@Module({
  imports: [CqrsModule, RoleQueryModule],
  providers: [
    { provide: ROLE_MODULE_API_TOKEN, useClass: RoleModuleApi },
  ],
  exports: [ROLE_MODULE_API_TOKEN],
})
export class RoleModule {}
