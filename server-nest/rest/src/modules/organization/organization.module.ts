import { Module } from '@nestjs/common';
import { OrganizationUseCasesModule } from './use-cases/use-cases.module';
import {
  AdminController,
  OrganizationController,
} from '@modules/organization/controllers';
import { PolicyFactory } from '@common/policy/factory.policy';

const Controllers = [OrganizationController, AdminController];

@Module({
  imports: [OrganizationUseCasesModule],
  controllers: [...Controllers],
  providers: [PolicyFactory],
})
export class OrganizationModule {}
