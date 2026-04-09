import { Module } from '@nestjs/common';
import { OrganizationUseCasesModule } from '@modules/organization/application/use-cases/use-cases.module';
import {
  AdminController,
  OrganizationController,
} from '@modules/organization/presentation/controllers';
import { PolicyFactory } from '@modules/policy/policy-factory';

const Controllers = [OrganizationController, AdminController];

@Module({
  imports: [OrganizationUseCasesModule],
  controllers: [...Controllers],
  providers: [PolicyFactory],
})
export class OrganizationModule {}
