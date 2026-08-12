import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard, CapabilityGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, HasCapability, IGetContext } from '@common/decorators';
import { CreateProductCategoryDto } from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreateProductCategoryCommand } from '@modules/supply/inventory/application/commands/create-product-category/create-product-category.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { PRODUCTCATEGORY } = CAPABILITIES;

@UseGuards(AuthGuard, CapabilityGuard)
@Controller('categories')
export class ProductCategoryCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(PRODUCTCATEGORY.create)
  @Post()
  create(
    @Body() dto: CreateProductCategoryDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreateProductCategoryCommand(dto, ctx));
  }
}
