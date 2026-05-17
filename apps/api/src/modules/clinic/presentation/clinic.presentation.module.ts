import { Module } from '@nestjs/common';
import {
  AdminController,
  ClinicController,
} from '@modules/clinic/presentation/controllers';
import { ClinicCommandModule } from '@modules/clinic/application/commands/command.module';
import { ClinicQueryModule } from '@modules/clinic/application/queries/query.module';

@Module({
  imports: [ClinicCommandModule, ClinicQueryModule],
  controllers: [AdminController, ClinicController],
})
export class ClinicPresentationModule {}
