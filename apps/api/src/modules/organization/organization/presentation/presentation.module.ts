import { Module } from '@nestjs/common';
import {
  OrganizationAdminCommandController,
  OrganizationCommandController,
  OrganizationQueryController,
} from '@modules/organization/organization/presentation/http/controllers';

@Module({
  controllers: [
    OrganizationQueryController,
    OrganizationCommandController,
    OrganizationAdminCommandController,
  ],
})
export class OrganizationPresentationModule {}
