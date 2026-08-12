import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreateSupplierCommand } from '@modules/supply/inventory/application/commands/create-supplier/create-supplier.command';
import { UpdateSupplierCommand } from '@modules/supply/inventory/application/commands/update-supplier/update-supplier.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { SUPPLIER } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('suppliers')
export class SupplierCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(SUPPLIER.create)
  @Post()
  create(@Body() dto: CreateSupplierDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateSupplierCommand(dto, ctx));
  }

  @HasCapability(SUPPLIER.update)
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
