import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SoftDeleteClinicUseCase } from '@clinic-use-cases';
import { AuthGuard } from '@common/guards';
import { SystemAdminGuard } from '@common/guards/system-admin/system-admin.guard';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly SoftDeleteClinicUseCase: SoftDeleteClinicUseCase,
  ) {}

  @Delete(':clinicId')
  softDelete(@Param('clinicId', ParseUUIDPipe) clinicId: string) {
    return this.SoftDeleteClinicUseCase.execute(clinicId);
  }
}
