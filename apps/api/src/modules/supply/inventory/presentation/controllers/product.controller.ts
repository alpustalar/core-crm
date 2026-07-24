import {
  Body,
  Controller,
  Delete,
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
  CreateProductDto,
  UpdateProductDto,
} from '@shared/modules/inventory/dto/commands';
import { TSCommandBus } from '@common/cqrs/type-safe-command-bus';
import { TSQueryBus } from '@common/cqrs/type-safe-query-bus';
import { CreateProductCommand } from '@modules/supply/inventory/application/commands/create-product/create-product.command';
import { UpdateProductCommand } from '@modules/supply/inventory/application/commands/update-product/update-product.command';
import { SoftDeleteProductCommand } from '@modules/supply/inventory/application/commands/soft-delete-product/soft-delete-product.command';
import { FindProductsQuery } from '@modules/supply/inventory/application/queries/find-products/find-products.query';

@UseGuards(AuthGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateProductDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateProductCommand(dto, ctx));
  }

  @Get()
  list(@Query() pagination: PaginationDto, @GetContext() ctx: IGetContext) {
    return this.queryBus.execute(new FindProductsQuery(pagination, ctx));
  }

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
