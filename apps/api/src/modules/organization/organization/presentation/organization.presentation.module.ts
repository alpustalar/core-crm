import { Module } from '@nestjs/common';
import {
  AdminController,
  OrganizationController,
} from '@modules/organization/organization/presentation/controllers';
import { OrganizationCommandModule } from '@modules/organization/organization/application/commands/command.module';
import { OrganizationQueryModule } from '@modules/organization/organization/application/queries/query.module';

@Module({
  imports: [OrganizationCommandModule, OrganizationQueryModule],
  controllers: [OrganizationController, AdminController],
})
export class OrganizationPresentationModule {}
