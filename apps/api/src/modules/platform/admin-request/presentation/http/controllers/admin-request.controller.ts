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
  CreateAdminRequestDto,
  ReviewAdminRequestDto,
} from '@shared/modules/admin-request/dto/commands';
import { FindAdminRequestsDto } from '@shared/modules/admin-request/dto/queries';
import { CreateAdminRequestCommand } from '@modules/platform/admin-request/application/commands/create-admin-request/create-admin-request.command';
import { ReviewAdminRequestCommand } from '@modules/platform/admin-request/application/commands/review-admin-request/review-admin-request.command';
import { FindAdminRequestsQuery } from '@modules/platform/admin-request/application/queries/find-admin-requests/find-admin-requests.query';

@UseGuards(AuthGuard)
@Controller()
export class AdminRequestController {
  constructor(
    private readonly commandBus: TSCommandBus,
    private readonly queryBus: TSQueryBus
  ) {}

  @Post()
  create(@Body() dto: CreateAdminRequestDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateAdminRequestCommand(dto, ctx));
  }

  @Get()
  findMany(
    @Query() dto: FindAdminRequestsDto,
    @Query() pagination: PaginationDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.queryBus.execute(
      new FindAdminRequestsQuery({ filter: dto, pagination, ctx })
    );
  }

  @Put(':requestId/review')
  review(
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: ReviewAdminRequestDto,
    @GetContext() ctx: IGetContext
  ) {
    return this.commandBus.execute(
      new ReviewAdminRequestCommand({ requestId, data: dto, ctx })
    );
  }
}
