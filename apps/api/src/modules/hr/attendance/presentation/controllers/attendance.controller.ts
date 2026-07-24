import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { PaginationDto } from '@shared';
import { RecordAttendanceDto } from '@shared/modules/attendance/dto/commands';
import {
  GetAttendanceFilterDto,
  GetAttendanceSummaryFilterDto,
} from '@shared/modules/attendance/dto/queries';
import { CheckInCommand } from '@modules/hr/attendance/application/commands/check-in/check-in.command';
import { CheckOutCommand } from '@modules/hr/attendance/application/commands/check-out/check-out.command';
import { RecordAttendanceCommand } from '@modules/hr/attendance/application/commands/record-attendance/record-attendance.command';
import { GetAttendanceByEmployeeQuery } from '@modules/hr/attendance/application/queries/get-attendance-by-employee/get-attendance-by-employee.query';
import { GetAttendanceSummaryQuery } from '@modules/hr/attendance/application/queries/get-attendance-summary/get-attendance-summary.query';

@UseGuards(AuthGuard)
@Controller()
export class AttendanceController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post('employees/:employeeId/attendance/check-in')
  checkIn(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CheckInCommand(employeeId, ctx));
  }

  @Post('employees/:employeeId/attendance/check-out')
  checkOut(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CheckOutCommand(employeeId, ctx));
  }

  @Put('employees/:employeeId/attendance')
  record(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: RecordAttendanceDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RecordAttendanceCommand({ employeeId, data: dto, ctx })
    );
  }

  @Get('employees/:employeeId/attendance')
  list(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query() dto: GetAttendanceFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetAttendanceByEmployeeQuery({
        employeeId,
        filter: dto,
        pagination,
        ctx,
      })
    );
  }

  @Get('employees/:employeeId/attendance/summary')
  summary(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query() dto: GetAttendanceSummaryFilterDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetAttendanceSummaryQuery({ employeeId, filter: dto, ctx })
    );
  }
}
