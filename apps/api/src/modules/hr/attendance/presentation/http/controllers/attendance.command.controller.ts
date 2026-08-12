import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { RecordAttendanceDto } from '@shared/modules/attendance/dto/commands';
import { CheckInCommand } from '@modules/hr/attendance/application/commands/check-in/check-in.command';
import { CheckOutCommand } from '@modules/hr/attendance/application/commands/check-out/check-out.command';
import { RecordAttendanceCommand } from '@modules/hr/attendance/application/commands/record-attendance/record-attendance.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { ATTENDANCERECORD } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class AttendanceCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(ATTENDANCERECORD.create)
  @Post('employees/:employeeId/attendance/check-in')
  checkIn(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CheckInCommand(employeeId, ctx));
  }

  @HasCapability(ATTENDANCERECORD.update)
  @Post('employees/:employeeId/attendance/check-out')
  checkOut(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CheckOutCommand(employeeId, ctx));
  }

  @HasCapability(ATTENDANCERECORD.update)
  @Put('employees/:employeeId/attendance')
  record(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: RecordAttendanceDto,
    @GetContext() ctx: IGetContext
  ) {
    // Rota'da :clinicId segmenti yok; kapsam gövdeden gelir (organizationId
    // opsiyonel — verilmezse handler TENANT_SCOPE_RESOLVER ile çözer).
    return this.commandBus.execute(
      new RecordAttendanceCommand({
        employeeId,
        data: dto,
        ctx,
        clinicId: dto.clinicId,
        organizationId: dto.organizationId,
      })
    );
  }
}
