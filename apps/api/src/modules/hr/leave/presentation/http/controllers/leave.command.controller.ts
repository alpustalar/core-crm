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
import {
  RequestLeaveDto,
  ReviewLeaveDto,
} from '@shared/modules/leave/dto/commands';
import { RequestLeaveCommand } from '@modules/hr/leave/application/commands/request-leave/request-leave.command';
import { ApproveLeaveCommand } from '@modules/hr/leave/application/commands/approve-leave/approve-leave.command';
import { RejectLeaveCommand } from '@modules/hr/leave/application/commands/reject-leave/reject-leave.command';
import { CancelLeaveCommand } from '@modules/hr/leave/application/commands/cancel-leave/cancel-leave.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { LEAVEREQUEST } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class LeaveCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(LEAVEREQUEST.create)
  @Post('employees/:employeeId/leaves')
  request(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: RequestLeaveDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RequestLeaveCommand({ employeeId, data: dto, ctx })
    );
  }

  @HasCapability(LEAVEREQUEST.update)
  @Put('leaves/:leaveId/approve')
  approve(
    @Param('leaveId', ParseUUIDPipe) leaveId: string,
    @Body() dto: ReviewLeaveDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ApproveLeaveCommand({ leaveId, data: dto, ctx })
    );
  }

  @HasCapability(LEAVEREQUEST.update)
  @Put('leaves/:leaveId/reject')
  reject(
    @Param('leaveId', ParseUUIDPipe) leaveId: string,
    @Body() dto: ReviewLeaveDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new RejectLeaveCommand({ leaveId, data: dto, ctx })
    );
  }

  @HasCapability(LEAVEREQUEST.update)
  @Put('leaves/:leaveId/cancel')
  cancel(
    @Param('leaveId', ParseUUIDPipe) leaveId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CancelLeaveCommand(leaveId, ctx));
  }
}
