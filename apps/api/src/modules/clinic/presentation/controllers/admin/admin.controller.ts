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

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly SoftDeleteClinicUseCase: SoftDeleteClinicUseCase
  ) {}

  @Delete(':clinicId')
  softDelete(@Param('clinicId', ParseUUIDPipe) clinicId: string) {
    return this.SoftDeleteClinicUseCase.execute(clinicId);
  }
}
