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
  CreateAdminRequestDto,
  ReviewAdminRequestDto,
} from '@shared/modules/admin-request/dto/commands';
import { CreateAdminRequestCommand } from '@modules/platform/admin-request/application/commands/create-admin-request/create-admin-request.command';
import { ReviewAdminRequestCommand } from '@modules/platform/admin-request/application/commands/review-admin-request/review-admin-request.command';
import { CAPABILITIES } from '@src/infrastructure/persistence/prisma/data/modules';

const { ADMINREQUEST } = CAPABILITIES;
@UseGuards(AuthGuard, CapabilityGuard)
@Controller()
export class AdminRequestCommandController {
  constructor(private readonly commandBus: TSCommandBus) {}

  @HasCapability(ADMINREQUEST.create)
  @Post()
  create(@Body() dto: CreateAdminRequestDto, @GetContext() ctx: IGetContext) {
    return this.commandBus.execute(new CreateAdminRequestCommand(dto, ctx));
  }

  @HasCapability(ADMINREQUEST.update)
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
