import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';

import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { PaginationDto } from '@shared';
import { ScheduleAppointmentDto } from '@shared/modules/appointment/dto/commands/schedule-appointment.dto';
import { StaffRescheduleDto } from '@shared/modules/appointment/dto/commands/staff-reschedule.dto';
import { CancelAppointmentDto } from '@shared/modules/appointment/dto/commands/cancel-appointment.dto';
import { GetClinicAppointmentsDto } from '@shared/modules/appointment/dto/queries/get-clinic-appointments.dto';
import { GetOrganizationAppointmentsDto } from '@shared/modules/appointment/dto/queries/get-organization-appointments.dto';
import { GetProviderCalendarDto } from '@shared/modules/appointment/dto/queries/get-provider-calendar.dto';
import { GetClinicOpenSlotsDto } from '@shared/modules/appointment/dto/queries/get-clinic-open-slots.dto';
import { GetClinicCalendarDto } from '@shared/modules/appointment/dto/queries/get-clinic-calendar.dto';
import { SearchClinicAppointmentsDto } from '@shared/modules/appointment/dto/queries/search-clinic-appointments.dto';
import { GetUpcomingRemindersDto } from '@shared/modules/appointment/dto/queries/get-upcoming-reminders.dto';
import { GetClinicDailySummaryDto } from '@shared/modules/appointment/dto/queries/get-clinic-daily-summary.dto';
import { CheckAppointmentConflictsDto } from '@shared/modules/appointment/dto/queries/check-appointment-conflicts.dto';
import { GetWaitingRoomDto } from '@shared/modules/appointment/dto/queries/get-waiting-room.dto';
import { UpdateAppointmentDetailsDto } from '@shared/modules/appointment/dto/commands/update-appointment-details.dto';
import { CancelProviderDayDto } from '@shared/modules/appointment/dto/commands/cancel-provider-day.dto';
import { AppointmentSlotDto } from '@shared/modules/appointment/dto/commands/appointment-slot.dto';
import { GetClinicAppointmentsQuery } from '@modules/clinical/appointment/application/queries/get-clinic-appointments/get-clinic-appointments.query';
import { GetOrganizationAppointmentsQuery } from '@modules/clinical/appointment/application/queries/get-organization-appointments/get-organization-appointments.query';
import { GetActionRequiredQuery } from '@modules/clinical/appointment/application/queries/get-action-required/get-action-required.query';
import { GetProviderCalendarQuery } from '@modules/clinical/appointment/application/queries/get-provider-calendar/get-provider-calendar.query';
import { GetClinicOpenSlotsQuery } from '@modules/clinical/appointment/application/queries/get-clinic-open-slots/get-clinic-open-slots.query';
import { GetClinicCalendarQuery } from '@modules/clinical/appointment/application/queries/get-clinic-calendar/get-clinic-calendar.query';
import { SearchClinicAppointmentsQuery } from '@modules/clinical/appointment/application/queries/search-clinic-appointments/search-clinic-appointments.query';
import { GetUpcomingRemindersQuery } from '@modules/clinical/appointment/application/queries/get-upcoming-reminders/get-upcoming-reminders.query';
import { GetClinicDailySummaryQuery } from '@modules/clinical/appointment/application/queries/get-clinic-daily-summary/get-clinic-daily-summary.query';
import { CheckAppointmentConflictsQuery } from '@modules/clinical/appointment/application/queries/check-appointment-conflicts/check-appointment-conflicts.query';
import { GetWaitingRoomQuery } from '@modules/clinical/appointment/application/queries/get-waiting-room/get-waiting-room.query';
import { UpdateAppointmentDetailsCommand } from '@modules/clinical/appointment/application/commands/update-appointment-details/update-appointment-details.command';
import { CancelProviderDayCommand } from '@modules/clinical/appointment/application/commands/cancel-provider-day/cancel-provider-day.command';
import { CheckInAppointmentCommand } from '@modules/clinical/appointment/application/commands/check-in-appointment/check-in-appointment.command';
import { LockAppointmentSlotCommand } from '@modules/clinical/appointment/application/commands/lock-appointment-slot/lock-appointment-slot.command';
import { ReleaseAppointmentSlotCommand } from '@modules/clinical/appointment/application/commands/release-appointment-slot/release-appointment-slot.command';
import { GetAppointmentDetailQuery } from '@modules/clinical/appointment/application/queries/get-appointment-detail/get-appointment-detail.query';
import { ScheduleAppointmentCommand } from '@modules/clinical/appointment/application/commands/schedule-appointment/schedule-appointment.command';
import { StaffRescheduleCommand } from '@modules/clinical/appointment/application/commands/staff-reschedule/staff-reschedule.command';
import { CancelAppointmentCommand } from '@modules/clinical/appointment/application/commands/cancel-appointment/cancel-appointment.command';
import { ConfirmAppointmentCommand } from '@modules/clinical/appointment/application/commands/confirm-appointment/confirm-appointment.command';
import { CompleteAppointmentCommand } from '@modules/clinical/appointment/application/commands/complete-appointment/complete-appointment.command';
import { MarkNoShowCommand } from '@modules/clinical/appointment/application/commands/mark-no-show/mark-no-show.command';

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
  getAll(
    @Query() dto: GetClinicAppointmentsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetClinicAppointmentsQuery({ filter: dto, pagination, ctx })
    );
  }

  @Get('organization')
  @HasCapability(APPOINTMENT.read)
  getOrganizationAppointments(
    @Query() dto: GetOrganizationAppointmentsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetOrganizationAppointmentsQuery(dto, ctx)
    );
  }

  @Get('action-required')
  @HasCapability(APPOINTMENT.read)
  getActionRequired(
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string
  ) {
    return this.queryBus.execute(
      new GetActionRequiredQuery({ clinicId, pagination, ctx })
    );
  }

  @Get('provider')
  @HasCapability(APPOINTMENT.read)
  getProviderCalendar(
    @Query() dto: GetProviderCalendarDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetProviderCalendarQuery({ filter: dto, ctx, pagination })
    );
  }

  @Get('open-slots')
  @HasCapability(APPOINTMENT.read)
  getClinicOpenSlots(
    @Query() dto: GetClinicOpenSlotsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetClinicOpenSlotsQuery(dto, ctx));
  }

  @Get('calendar')
  @HasCapability(APPOINTMENT.read)
  getClinicCalendar(
    @Query() dto: GetClinicCalendarDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetClinicCalendarQuery(dto, ctx));
  }

  @Get('search')
  @HasCapability(APPOINTMENT.read)
  searchClinicAppointments(
    @Query() dto: SearchClinicAppointmentsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new SearchClinicAppointmentsQuery(dto, ctx));
  }

  @Get('reminders')
  @HasCapability(APPOINTMENT.read)
  getUpcomingReminders(
    @Query() dto: GetUpcomingRemindersDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetUpcomingRemindersQuery(dto, ctx));
  }

  @Get('daily-summary')
  @HasCapability(APPOINTMENT.read)
  getClinicDailySummary(
    @Query() dto: GetClinicDailySummaryDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetClinicDailySummaryQuery(dto, ctx));
  }

  @Get('conflicts')
  @HasCapability(APPOINTMENT.read)
  checkConflicts(
    @Query() dto: CheckAppointmentConflictsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new CheckAppointmentConflictsQuery({ filter: dto, ctx })
    );
  }

  @Get('waiting-room')
  @HasCapability(APPOINTMENT.read)
  getWaitingRoom(
    @Query() dto: GetWaitingRoomDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetWaitingRoomQuery(dto, ctx));
  }

  @Get(':id')
  @HasCapability(APPOINTMENT.read)
  getDetail(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.queryBus.execute(new GetAppointmentDetailQuery(id, ctx));
  }

  //? ====================================================================================
  //! COMMANDS
  //? ====================================================================================

  @Post('schedule')
  @HasCapability(APPOINTMENT.create)
  schedule(
    @Body() dto: ScheduleAppointmentDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new ScheduleAppointmentCommand(dto, ctx));
  }

  @Post('slots/lock')
  @HasCapability(APPOINTMENT.create)
  lockSlot(@Body() dto: AppointmentSlotDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(
      new LockAppointmentSlotCommand({ data: dto, ctx })
    );
  }

  @Post('slots/release')
  @HasCapability(APPOINTMENT.create)
  releaseSlot(
    @Body() dto: AppointmentSlotDto,
    @GetContext() ctx: IGetContext,
    @Param('holderId') holderId: string
  ) {
    return this.commandBus.execute(
      new ReleaseAppointmentSlotCommand({ data: dto, ctx, holderId })
    );
  }

  @Patch('provider/cancel-day')
  @HasCapability(APPOINTMENT.update)
  cancelProviderDay(
    @Body() dto: CancelProviderDayDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CancelProviderDayCommand(dto, ctx));
  }

  @Patch(':id/details')
  @HasCapability(APPOINTMENT.update)
  updateDetails(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDetailsDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateAppointmentDetailsCommand({ appointmentId: id, data: dto, ctx })
    );
  }

  @Patch(':id/reschedule')
  @HasCapability(APPOINTMENT.update)
  reschedule(
    @Param('id') id: string,
    @Body() dto: StaffRescheduleDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new StaffRescheduleCommand({ ...dto, appointmentId: id }, ctx)
    );
  }

  @Patch(':id/cancel')
  @HasCapability(APPOINTMENT.update)
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
    @GetContext() ctx: IGetContext
  ) {
    const data = { ...dto, appointmentId: id };
    return this.commandBus.execute(new CancelAppointmentCommand(data, ctx));
  }

  @Patch(':id/confirm')
  @HasCapability(APPOINTMENT.update)
  confirm(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new ConfirmAppointmentCommand(id, ctx));
  }

  @Patch(':id/complete')
  @HasCapability(APPOINTMENT.update)
  complete(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CompleteAppointmentCommand(id, ctx));
  }

  @Patch(':id/no-show')
  @HasCapability(APPOINTMENT.update)
  noShow(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new MarkNoShowCommand(id, ctx));
  }

  @Patch(':id/check-in')
  @HasCapability(APPOINTMENT.update)
  checkIn(@Param('id') id: string, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CheckInAppointmentCommand(id, ctx));
  }
}
