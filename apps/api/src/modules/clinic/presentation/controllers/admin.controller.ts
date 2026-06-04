import {
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/auth/guards';
import { SystemAdminGuard } from '@modules/auth/guards/system-admin/system-admin.guard';
import { SoftDeleteClinicCommand } from '@modules/clinic/application/commands/soft-delete-clinic/soft-delete-clinic.command';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import {
  GetContext,
  IGetContext,
} from '@common/decorators/get-context.decorator';

@UseGuards(AuthGuard, SystemAdminGuard)
@Controller('')
export class AdminController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Delete(':clinicId')
  softDelete(
    @Param('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new SoftDeleteClinicCommand(clinicId, ctx));
  }
}
