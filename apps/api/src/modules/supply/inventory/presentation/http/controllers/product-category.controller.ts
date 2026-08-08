import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/identity/auth/auth/guards';
import { GetContext, IGetContext } from '@common/decorators';
import { CreateProductCategoryDto } from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { CreateProductCategoryCommand } from '@modules/supply/inventory/application/commands/create-product-category/create-product-category.command';

@UseGuards(AuthGuard)
@Controller('categories')
export class ProductCategoryController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @Post()
  create(
    @Body() dto: CreateProductCategoryDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(new CreateProductCategoryCommand(dto, ctx));
  }
}
