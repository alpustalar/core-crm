import { Module } from '@nestjs/common';
import {
  ClinicAdminCommandController,
  ClinicCommandController,
} from '@modules/organization/clinic/presentation/http/controllers';

@Module({ controllers: [ClinicAdminCommandController, ClinicCommandController] })
export class ClinicPresentationModule {}
