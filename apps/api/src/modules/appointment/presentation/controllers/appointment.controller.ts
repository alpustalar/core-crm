import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/auth/guards';
import {
  CancelAppointmentUseCase,
  CompleteAppointmentUseCase,
  ConfirmAppointmentUseCase,
  MarkNoShowUseCase,
  ScheduleAppointmentUseCase,
  StaffRescheduleUseCase,
} from '@modules/appointment/application/use-cases/commands';
import {
  GetActionRequiredUseCase,
  GetAllAppointmentsUseCase,
  GetAppointmentDetailUseCase,
  GetOrganizationAppointmentsUseCase,
  GetProviderCalendarUseCase,
} from '@modules/appointment/application/use-cases/queries';
import { Actor, HasCapability } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import {
  CalendarQueryDto,
  GetOrganizationAppointmentsDto,
  PaginationDto,
  ScheduleAppointmentDto,
  StaffRescheduleDto,
} from '@shared';
import { ActorContext } from '@common/interfaces';

const { APPOINTMENT } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class AppointmentController {
  constructor(
    private readonly scheduleAppointmentUseCase: ScheduleAppointmentUseCase,
    private readonly staffRescheduleUseCase: StaffRescheduleUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly confirmAppointmentUseCase: ConfirmAppointmentUseCase,
    private readonly completeAppointmentUseCase: CompleteAppointmentUseCase,
    private readonly markNoShowUseCase: MarkNoShowUseCase,
    private readonly getAllAppointmentsUseCase: GetAllAppointmentsUseCase,
    private readonly getAppointmentDetailUseCase: GetAppointmentDetailUseCase,
    private readonly getProviderCalendarUseCase: GetProviderCalendarUseCase,
    private readonly getActionRequiredUseCase: GetActionRequiredUseCase,
    private readonly getOrganizationAppointmentsUseCase: GetOrganizationAppointmentsUseCase
  ) {}

  //? ====================================================================================
  //! QUERIES
  //? ====================================================================================

  @Get()
  @HasCapability(APPOINTMENT.read)
  getAll(@Query() query: CalendarQueryDto, @Actor() actor: ActorContext) {
    return this.getAllAppointmentsUseCase.execute(query, actor);
  }

  @Get('organization')
  @HasCapability(APPOINTMENT.read)
  getOrganizationAppointments(
    @Query() query: GetOrganizationAppointmentsDto,
    @Actor() actor: ActorContext
  ) {
    return this.getOrganizationAppointmentsUseCase.execute(query, actor);
  }

  @Get('action-required')
  @HasCapability(APPOINTMENT.read)
  getActionRequired(
    @Query() pagination: PaginationDto,
    @Actor() actor: ActorContext
  ) {
    return this.getActionRequiredUseCase.execute(pagination, actor);
  }

  @Get('provider/:providerId')
  @HasCapability(APPOINTMENT.read)
  getProviderCalendar(
    @Param('providerId') providerId: string,
    @Query() query: CalendarQueryDto,
    @Actor() actor: ActorContext
  ) {
    return this.getProviderCalendarUseCase.execute(
      {
        providerId,
        ...query,
      },
      actor
    );
  }

  @Get(':id')
  @HasCapability(APPOINTMENT.read)
  getDetail(@Param('id') id: string, @Actor() actor: ActorContext) {
    return this.getAppointmentDetailUseCase.execute(id, actor);
  }

  //? ====================================================================================
  //! COMMANDS
  //? ====================================================================================

  @Post('schedule')
  @HasCapability(APPOINTMENT.create)
  schedule(@Body() dto: ScheduleAppointmentDto, @Actor() actor: ActorContext) {
    return this.scheduleAppointmentUseCase.execute(dto, actor);
  }

  @Patch(':id/reschedule')
  @HasCapability(APPOINTMENT.update)
  reschedule(
    @Param('id') id: string,
    @Body() dto: StaffRescheduleDto,
    @Actor() actor: ActorContext
  ) {
    return this.staffRescheduleUseCase.execute(
      { ...dto, appointmentId: id },
      actor
    );
  }

  @Patch(':id/cancel')
  @HasCapability(APPOINTMENT.update)
  cancel(
    @Param('id') id: string,
    @Query('cancelReason') cancelReason: string | undefined,
    @Actor() actor: ActorContext
  ) {
    return this.cancelAppointmentUseCase.execute(
      { appointmentId: id, cancelReason },
      actor
    );
  }

  @Patch(':id/confirm')
  @HasCapability(APPOINTMENT.update)
  confirm(@Param('id') id: string, @Actor() actor: ActorContext) {
    return this.confirmAppointmentUseCase.execute(id, actor);
  }

  @Patch(':id/complete')
  @HasCapability(APPOINTMENT.update)
  complete(@Param('id') id: string, @Actor() actor: ActorContext) {
    return this.completeAppointmentUseCase.execute(id, actor);
  }

  @Patch(':id/no-show')
  @HasCapability(APPOINTMENT.update)
  noShow(@Param('id') id: string, @Actor() actor: ActorContext) {
    return this.markNoShowUseCase.execute(id, actor);
  }
}
