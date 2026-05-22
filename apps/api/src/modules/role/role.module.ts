import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RoleQueryModule } from '@modules/role/application/queries/query.module';

@Module({
  imports: [CqrsModule, RoleQueryModule],
})
export class RoleModule {}
