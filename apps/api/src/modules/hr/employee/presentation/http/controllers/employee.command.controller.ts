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
  AddEmployeeContractDto,
  CreateEmployeeDto,
  TerminateEmployeeDto,
  UpdateEmployeeDto,
} from '@shared/modules/employee/dto/commands';
import { CreateEmployeeCommand } from '@modules/hr/employee/application/commands/create-employee/create-employee.command';
import { UpdateEmployeeCommand } from '@modules/hr/employee/application/commands/update-employee/update-employee.command';
import { TerminateEmployeeCommand } from '@modules/hr/employee/application/commands/terminate-employee/terminate-employee.command';
import { AddEmployeeContractCommand } from '@modules/hr/employee/application/commands/add-employee-contract/add-employee-contract.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { EMPLOYEE, EMPLOYEECONTRACT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class EmployeeCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(EMPLOYEE.create)
  @Post()
  create(@Body() dto: CreateEmployeeDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateEmployeeCommand(dto, ctx));
  }

  @HasCapability(EMPLOYEE.update)
  @Put(':employeeId')
  update(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: UpdateEmployeeDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateEmployeeCommand({ employeeId, data: dto, ctx })
    );
  }

  @HasCapability(EMPLOYEE.update)
  @Put(':employeeId/terminate')
  terminate(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: TerminateEmployeeDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new TerminateEmployeeCommand({ employeeId, data: dto, ctx })
    );
  }

  @HasCapability(EMPLOYEECONTRACT.create)
  @Post(':employeeId/contracts')
  addContract(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() dto: AddEmployeeContractDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new AddEmployeeContractCommand({ employeeId, data: dto, ctx })
    );
  }
}
