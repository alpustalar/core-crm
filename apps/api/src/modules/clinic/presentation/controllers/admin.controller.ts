import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards';
import { SystemAdminGuard } from '@modules/auth/guards/system-admin/system-admin.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SoftDeleteClinicCommand } from '@modules/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.use-case-by-id.command';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('')
export class AdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @Delete(':clinicId')
  softDelete(@Param('clinicId', ParseUUIDPipe) clinicId: string) {
    return this.commandBus.execute(new SoftDeleteClinicCommand(clinicId));
  }
}
