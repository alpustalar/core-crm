import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SoftDeleteClinicUseCase } from '@modules/clinic/application/use-cases';
import { AuthGuard } from '@modules/auth/guards';
import { SystemAdminGuard } from '@modules/auth/guards/system-admin/system-admin.guard';
import { ClinicPaths } from '@modules/clinic/presentation/controllers/paths';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller(ClinicPaths.ADMIN)
export class AdminController {
  constructor(
    private readonly SoftDeleteClinicUseCase: SoftDeleteClinicUseCase
  ) {}

  @Delete(':clinicId')
  softDelete(@Param('clinicId', ParseUUIDPipe) clinicId: string) {
    return this.SoftDeleteClinicUseCase.execute(clinicId);
  }
}
