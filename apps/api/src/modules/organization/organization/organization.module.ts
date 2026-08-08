import { Module } from '@nestjs/common';
import { OrganizationPresentationModule } from '@modules/organization/organization/presentation/presentation.module';

@Module({ imports: [OrganizationPresentationModule] })
export class OrganizationModule {}
