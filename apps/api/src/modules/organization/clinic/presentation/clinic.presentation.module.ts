import { Module } from '@nestjs/common';
import {
  AdminController,
  ClinicController,
} from '@modules/organization/clinic/presentation/controllers';
import { ClinicCommandModule } from '@modules/organization/clinic/application/commands/command.module';
import { ClinicQueryModule } from '@modules/organization/clinic/application/queries/query.module';

@Module({
  imports: [ClinicCommandModule, ClinicQueryModule],
  controllers: [AdminController, ClinicController],
})
export class ClinicPresentationModule {}
