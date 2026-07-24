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
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { PaginationDto } from '@shared';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CreateSupplierCommand } from '@modules/supply/inventory/application/commands/create-supplier/create-supplier.command';
import { UpdateSupplierCommand } from '@modules/supply/inventory/application/commands/update-supplier/update-supplier.command';
import { FindSuppliersQuery } from '@modules/supply/inventory/application/queries/find-suppliers/find-suppliers.query';

@UseGuards(AuthGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateSupplierDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateSupplierCommand(dto, ctx));
  }

  @Get()
  list(
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext,
    @Param('organizationId', ParseUUIDPipe) organizationId: string
  ) {
    return this.queryBus.execute(
      new FindSuppliersQuery({ ctx, organizationId, pagination })
    );
  }

  @Patch(':supplierId')
  update(
    @Param('supplierId') supplierId: string,
    @Body() dto: UpdateSupplierDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateSupplierCommand(supplierId, dto, ctx)
    );
  }
}
