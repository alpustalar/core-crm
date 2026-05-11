import { Module } from '@nestjs/common';
import {
  AdminController,
  ClinicController,
} from '@modules/clinic/presentation/controllers';
import { ClinicUseCaseModule } from '@modules/clinic/application/use-cases/clinic-use-case.module';

@Module({
  imports: [ClinicUseCaseModule],
  controllers: [AdminController, ClinicController],
})
export class ClinicPresentationModule {}
