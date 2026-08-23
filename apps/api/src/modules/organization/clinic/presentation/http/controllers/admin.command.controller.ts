import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { SystemAdminGuard } from '@modules/identity/auth/auth/guards/system-admin/system-admin.guard';
import { SoftDeleteClinicCommand } from '@modules/organization/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('')
export class ClinicAdminCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Delete(':clinicId')
  softDelete(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new SoftDeleteClinicCommand(clinicId, ctx));
  }
}
