import { Module } from '@nestjs/common';
import { RoleQueryModule } from '@modules/role/application/queries/query.module';

@Module({
  imports: [RoleQueryModule],
})
export class RoleModule {}
