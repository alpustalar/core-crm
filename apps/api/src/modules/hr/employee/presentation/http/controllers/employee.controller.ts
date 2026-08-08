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
import { Serialize } from '@common/decorators/serialize.decorator';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { Employee, PaginationDto } from '@shared';
import { EmployeeResponseDto } from '@modules/hr/employee/presentation/http/dto';
import {
  AddEmployeeContractDto,
  CreateEmployeeDto,
  TerminateEmployeeDto,
  UpdateEmployeeDto,
} from '@shared/modules/employee/dto/commands';
import { GetEmployeesDto } from '@shared/modules/employee/dto/queries';
import { CreateEmployeeCommand } from '@modules/hr/employee/application/commands/create-employee/create-employee.command';
import { UpdateEmployeeCommand } from '@modules/hr/employee/application/commands/update-employee/update-employee.command';
import { TerminateEmployeeCommand } from '@modules/hr/employee/application/commands/terminate-employee/terminate-employee.command';
import { AddEmployeeContractCommand } from '@modules/hr/employee/application/commands/add-employee-contract/add-employee-contract.command';
import { GetEmployeesQuery } from '@modules/hr/employee/application/queries/get-employees/get-employees.query';
import { GetEmployeeByIdQuery } from '@modules/hr/employee/application/queries/get-employee-by-id/get-employee-by-id.query';

@UseGuards(AuthGuard)
@Controller()
export class EmployeeController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateEmployeeCommand(dto, ctx));
  }

  @Get()
  @Serialize<Employee, EmployeeResponseDto>(EmployeeResponseDto)
  list(
    @Query() dto: GetEmployeesDto,
    @Query() pagination: PaginationDto,
    @Query('clinicId', ParseUUIDPipe) clinicId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new GetEmployeesQuery({ clinicId, filter: dto, pagination, ctx })
    );
  }

  @Get(':employeeId')
  @Serialize<Employee, EmployeeResponseDto>(EmployeeResponseDto)
  getById(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(new GetEmployeeByIdQuery(employeeId, ctx));
  }

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
