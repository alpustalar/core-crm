import { Module } from '@nestjs/common';
import { OrganizationUseCasesModule } from '@modules/organization/application/use-cases/use-cases.module';
import {
  AdminController,
  OrganizationController,
} from '@modules/organization/presentation/controllers';

@Module({
  imports: [OrganizationUseCasesModule],
  controllers: [OrganizationController, AdminController],
})
export class OrganizationPresentationModule {}
