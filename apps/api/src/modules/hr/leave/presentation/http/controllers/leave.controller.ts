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
import {
  RequestLeaveDto,
  ReviewLeaveDto,
} from '@shared/modules/leave/dto/commands';
import { RequestLeaveCommand } from '@modules/hr/leave/application/commands/request-leave/request-leave.command';
import { ApproveLeaveCommand } from '@modules/hr/leave/application/commands/approve-leave/approve-leave.command';
import { RejectLeaveCommand } from '@modules/hr/leave/application/commands/reject-leave/reject-leave.command';
import { CancelLeaveCommand } from '@modules/hr/leave/application/commands/cancel-leave/cancel-leave.command';
import { GetLeavesByEmployeeQuery } from '@modules/hr/leave/application/queries/get-leaves-by-employee/get-leaves-by-employee.query';
import { GetPendingLeavesQuery } from '@modules/hr/leave/application/queries/get-pending-leaves/get-pending-leaves.query';
import { GetLeaveBalanceQuery } from '@modules/hr/leave/application/queries/get-leave-balance/get-leave-balance.query';
import { GetLeavesFilterDto } from '@shared/modules/leave/dto/queries/get-leaves.dto';

@UseGuards(AuthGuard)
@Controller()
export class LeaveController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

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

  @Get('employees/:employeeId/leaves')
  listByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Query() dto: GetLeavesFilterDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetLeavesByEmployeeQuery({ employeeId, filter: dto, pagination, ctx })
    );
  }

  @Get('employees/:employeeId/leaves/balance')
  balance(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetLeaveBalanceQuery(employeeId, ctx));
  }

  @Get('leaves/pending')
  pending(
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext,
    @Param('clinicId', ParseUUIDPipe) clinicId: string
  ) {
    return this.queryBus.execute(
      new GetPendingLeavesQuery({ pagination, ctx, clinicId })
    );
  }

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

  @Put('leaves/:leaveId/cancel')
  cancel(
    @Param('leaveId', ParseUUIDPipe) leaveId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CancelLeaveCommand(leaveId, ctx));
  }
}
