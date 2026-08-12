import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import {
  CreateProductDto,
  UpdateProductDto,
} from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreateProductCommand } from '@modules/supply/inventory/application/commands/create-product/create-product.command';
import { UpdateProductCommand } from '@modules/supply/inventory/application/commands/update-product/update-product.command';
import { SoftDeleteProductCommand } from '@modules/supply/inventory/application/commands/soft-delete-product/soft-delete-product.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PRODUCT } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller('products')
export class ProductCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(PRODUCT.create)
  @Post()
  create(@Body() dto: CreateProductDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateProductCommand(dto, ctx));
  }

  @HasCapability(PRODUCT.update)
  @Patch(':productId')
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new UpdateProductCommand({ productId, ctx, data: dto })
    );
  }

  @HasCapability(PRODUCT.delete)
  @Delete(':productId')
  softDelete(
    @Param('productId') productId: string,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new SoftDeleteProductCommand(productId, ctx)
    );
  }
}
