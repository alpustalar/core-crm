import { Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';

import { HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';

const { APPOINTMENT } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class AppointmentController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  //? ====================================================================================
  //! QUERIES
  //? ====================================================================================

  @Get()
  @HasCapability(APPOINTMENT.read)
  getAll() {}

  @Get('organization')
  @HasCapability(APPOINTMENT.read)
  getOrganizationAppointments() {}

  @Get('action-required')
  @HasCapability(APPOINTMENT.read)
  getActionRequired() {}

  @Get('provider/:providerId')
  @HasCapability(APPOINTMENT.read)
  getProviderCalendar() {}

  @Get(':id')
  @HasCapability(APPOINTMENT.read)
  getDetail() {}

  //? ====================================================================================
  //! COMMANDS
  //? ====================================================================================

  @Post('schedule')
  @HasCapability(APPOINTMENT.create)
  schedule() {}

  @Patch(':id/reschedule')
  @HasCapability(APPOINTMENT.update)
  reschedule() {}

  @Patch(':id/cancel')
  @HasCapability(APPOINTMENT.update)
  cancel() {}

  @Patch(':id/confirm')
  @HasCapability(APPOINTMENT.update)
  confirm() {}

  @Patch(':id/complete')
  @HasCapability(APPOINTMENT.update)
  complete() {}

  @Patch(':id/no-show')
  @HasCapability(APPOINTMENT.update)
  noShow() {}
}
