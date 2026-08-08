import { Module } from '@nestjs/common';
import {
  AdminController,
  OrganizationController,
} from '@modules/organization/organization/presentation/http/controllers';

@Module({ controllers: [OrganizationController, AdminController] })
export class OrganizationPresentationModule {}
