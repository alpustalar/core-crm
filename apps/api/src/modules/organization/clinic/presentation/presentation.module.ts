import { Module } from '@nestjs/common';
import {
  AdminController,
  ClinicController,
} from '@modules/organization/clinic/presentation/http/controllers';

@Module({ controllers: [AdminController, ClinicController] })
export class ClinicPresentationModule {}
