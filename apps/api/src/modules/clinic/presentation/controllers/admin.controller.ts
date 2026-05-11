import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards';
import { SystemAdminGuard } from '@modules/auth/guards/system-admin/system-admin.guard';
import { SoftDeleteClinicByIdUseCase } from '@modules/clinic/application/use-cases/commands';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('')
export class AdminController {
  constructor(
    private readonly SoftDeleteClinicUseCase: SoftDeleteClinicByIdUseCase
  ) {}

  @Delete(':clinicId')
  softDelete(@Param('clinicId', ParseUUIDPipe) clinicId: string) {
    return this.SoftDeleteClinicUseCase.execute(clinicId);
  }
}
