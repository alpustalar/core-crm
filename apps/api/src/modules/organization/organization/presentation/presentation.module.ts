import { Module } from '@nestjs/common';
import {
  AdminController,
  OrganizationCommandController,
  OrganizationQueryController,
} from '@modules/organization/organization/presentation/http/controllers';

@Module({
  controllers: [
    OrganizationQueryController,
    OrganizationCommandController,
    AdminController,
  ],
})
export class OrganizationPresentationModule {}
